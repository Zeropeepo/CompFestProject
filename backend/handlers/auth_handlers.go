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

type UserRegistration struct {
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserProfile struct {
	ID       int    `json:"id"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Role     string `json:"role"`
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



