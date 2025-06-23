// File: backend/handlers/handlers.go
// This file has the required changes.

package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/Zeropeepo/sea-catering-backend/database"
	"golang.org/x/crypto/bcrypt"
)

// --- Structs ---
type UserRegistration struct {
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type Testimonials struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Review string `json:"review"`
	Rating int    `json:"rating"`
}

type Subscription struct {
	Name          string   `json:"name"`
	Phone         string   `json:"phone"`
	SelectedPlan  string   `json:"selectedPlan"`
	SelectedMeals []string `json:"selectedMeals"`
	SelectedDays  []string `json:"selectedDays"`
	Allergies     string   `json:"allergies"`
	TotalPrice    float64  `json:"totalPrice"`
}

type UserProfile struct {
	ID       int    `json:"id"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type UserSubscription struct {
	ID           int      `json:"id"`
	PlanName     string   `json:"planName"`
	MealTypes    []string `json:"mealTypes"`
	DeliveryDays []string `json:"deliveryDays"`
	TotalPrice   float64  `json:"totalPrice"`
	Status       string   `json:"status"`
}

type AdminDashboardData struct {
    NewSubscriptions        int     `json:"newSubscriptions"`
    MonthlyRecurringRevenue float64 `json:"monthlyRecurringRevenue"`
    ActiveSubscriptions     int     `json:"activeSubscriptions"`
    Reactivations           int     `json:"reactivations"` 
}


// --- Handlers ---

func GetAdminDashboardHandler(c *gin.Context) {
    var data AdminDashboardData

    // Get Subscription Count
    newSubsQuery := `SELECT COUNT(*) FROM subscriptions;`
    _ = database.DB.QueryRow(context.Background(), newSubsQuery).Scan(&data.NewSubscriptions)

    // Get Monthly Recurring Revenue
    mrrQuery := `SELECT COALESCE(SUM(total_price), 0) FROM subscriptions WHERE status = 'active';`
    _ = database.DB.QueryRow(context.Background(), mrrQuery).Scan(&data.MonthlyRecurringRevenue)

    // Get Active Subscriptions
    activeSubsQuery := `SELECT COUNT(*) FROM subscriptions WHERE status = 'active';`
    _ = database.DB.QueryRow(context.Background(), activeSubsQuery).Scan(&data.ActiveSubscriptions)
    
    //  Get Reactivations (Mock data for now)
    data.Reactivations = 0 

    c.JSON(http.StatusOK, data)
}

// Handler for GetUserSubscription
func GetUserSubscriptionsHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	sqlStatement := `
		SELECT id, plan_name, meal_types, delivery_days, total_price, status
		FROM subscriptions
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := database.DB.Query(context.Background(), sqlStatement, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}
	defer rows.Close()

	subscriptions := make([]UserSubscription, 0)
	for rows.Next() {
		var sub UserSubscription

		if err := rows.Scan(&sub.ID, &sub.PlanName, &sub.MealTypes, &sub.DeliveryDays, &sub.TotalPrice, &sub.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process subscription data"})
			return
		}
		subscriptions = append(subscriptions, sub)
	}
	c.JSON(http.StatusOK, subscriptions)
}

// Handler for GetUserProfile

func GetUserProfileHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var userProfile UserProfile
	sqlStatement := `SELECT id, full_name, email, role FROM users WHERE id = $1`
	err := database.DB.QueryRow(context.Background(), sqlStatement, userID.(int)).Scan(
		&userProfile.ID,
		&userProfile.FullName,
		&userProfile.Email,
		&userProfile.Role,
	)

	if err != nil {
        fmt.Printf("Error fetching user profile for ID %v: %v\n", userID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, userProfile)
}


func validatePassword(password string) bool {
	if len(password) < 8 { return false }
	match, _ := regexp.MatchString(`[A-Z]`, password)
	if !match { return false }
	match, _ = regexp.MatchString(`[a-z]`, password)
	if !match { return false }
	match, _ = regexp.MatchString(`[0-9]`, password)
	if !match { return false }
	match, _ = regexp.MatchString(`[\W_]`, password) 
	return match
}


// User registration handler
func RegisterHandler(c *gin.Context) {
	var user UserRegistration
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}
	if !validatePassword(user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters long and contain uppercase, lowercase, digit, and special character."})
		return 
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
		return
	}
	sqlStatement := `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`
	var id int
	err = database.DB.QueryRow(context.Background(), sqlStatement, user.Fullname, user.Email, string(hashedPassword)).Scan(&id)
	if err != nil {
		fmt.Printf("Error creating user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user. Email may already be in use."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully!", "userId": id})
}

// User login handler
func LoginHandler(c *gin.Context) {
	var loginCreds UserLogin
	var userFromDB struct {
		ID           int
		PasswordHash string
	}
	if err := c.ShouldBindJSON(&loginCreds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	sqlStatement := `SELECT id, password_hash FROM users WHERE email = $1`
	err := database.DB.QueryRow(context.Background(), sqlStatement, loginCreds.Email).Scan(&userFromDB.ID, &userFromDB.PasswordHash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(userFromDB.PasswordHash), []byte(loginCreds.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	csrfToken := uuid.New().String() 

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userFromDB.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
        "csrf": csrfToken,
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Send BOTH the JWT and the CSRF token back to the frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful!",
		"token":   tokenString,
        "csrf":    csrfToken, 
	})
}

// Creating a new testimonial
func CreateTestimonialsHandler(c *gin.Context) {
	var test Testimonials
	if err := c.ShouldBindJSON(&test); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}
	sqlStatement := `INSERT INTO testimonials (name, review, rating) VALUES ($1, $2, $3) RETURNING id`
	var id int
	err := database.DB.QueryRow(context.Background(), sqlStatement, test.Name, test.Review, test.Rating).Scan(&id)
	if err != nil {
		fmt.Printf("Error inserting testimonial: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create testimonial"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Testimonial created successfully!", "testimonialId": id})
}

// Reading Testimonials from the database
func GetTestimonialsHandler(c *gin.Context) {
	sqlStatement := `SELECT id, name, review, rating FROM testimonials ORDER BY created_at DESC`
	rows, err := database.DB.Query(context.Background(), sqlStatement)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch testimonials"})
		return
	}
	defer rows.Close()
	testimonials := make([]Testimonials, 0)
	for rows.Next() {
		var t Testimonials
		if err := rows.Scan(&t.ID, &t.Name, &t.Review, &t.Rating); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process testimonials"})
			return
		}
		testimonials = append(testimonials, t)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading testimonials data"})
		return
	}
	c.JSON(http.StatusOK, testimonials)
}

// Creating a new subscription
func SubscribeHandler(c *gin.Context) {
	var sub Subscription
	if err := c.ShouldBindJSON(&sub); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}

	// Get the user ID from the context that the middleware set for us.
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization context not found"})
		return
	}

	// UPDATED SQL statement to include the new user_id column.
	sqlStatement := `
		INSERT INTO subscriptions (name, phone_number, plan_name, meal_types, delivery_days, allergies, total_price, user_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`
	
	var id int
	// Pass the userID as the 8th parameter to the query.
	err := database.DB.QueryRow(context.Background(), sqlStatement,
		sub.Name,
		sub.Phone,
		sub.SelectedPlan,
		sub.SelectedMeals,
		sub.SelectedDays,
		sub.Allergies,
		sub.TotalPrice,
		userID.(int),
	).Scan(&id)

	if err != nil {
		fmt.Printf("Error inserting subscription: %v\n", err) // Log error to console
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Subscription created successfully!",
		"subscriptionId": id,
	})
}


func UpdateSubscriptionStatusHandler(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    // Get the subscription ID from the URL parameter (e.g., /api/subscriptions/123/status)
    subscriptionID := c.Param("id")

    // Bind the new status from the request body
    var payload struct {
        Status string `json:"status" binding:"required"` 
    }

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request. 'status' field is required."})
        return
    }

    if payload.Status != "paused" && payload.Status != "cancelled" && payload.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value."})
		return
	}

    sqlStatement := `
        UPDATE subscriptions
        SET status = $1
        WHERE id = $2 AND user_id = $3`

    result, err := database.DB.Exec(context.Background(), sqlStatement, payload.Status, subscriptionID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subscription status"})
        return
    }

    if result.RowsAffected() == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or you do not have permission to modify it"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Subscription status updated successfully to " + payload.Status})
}
