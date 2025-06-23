package handlers

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Zeropeepo/sea-catering-backend/database"
)

type Subscription struct {
	Name          string   `json:"name"`
	Phone         string   `json:"phone"`
	SelectedPlan  string   `json:"selectedPlan"`
	SelectedMeals []string `json:"selectedMeals"`
	SelectedDays  []string `json:"selectedDays"`
	Allergies     string   `json:"allergies"`
	TotalPrice    float64  `json:"totalPrice"`
}


type UserSubscription struct {
	ID           int      `json:"id"`
	PlanName     string   `json:"planName"`
	MealTypes    []string `json:"mealTypes"`
	DeliveryDays []string `json:"deliveryDays"`
	TotalPrice   float64  `json:"totalPrice"`
	Status       string   `json:"status"`
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

// UpdateSubscriptionStatusHandler updates the status of a subscription
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
