package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os" 
	"strconv" 
	"strings" 

	"github.com/gin-gonic/gin"
	"github.com/Zeropeepo/sea-catering-backend/database"
	"crypto/sha512"
    "encoding/hex"
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

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization context not found"})
		return
	}
	
	// MODIFIED SQL: Added 'status' column to the insert with a default value of 'pending'
	sqlStatement := `
		INSERT INTO subscriptions (name, phone_number, plan_name, meal_types, delivery_days, allergies, total_price, user_id, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
		RETURNING id`
	
	var id int
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
		fmt.Printf("Error inserting subscription: %v\n", err) 
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Subscription created, pending payment.",
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

func MidtransNotificationHandler(c *gin.Context) {
    fmt.Println("--- Midtrans Webhook Received ---") // Log that the handler was hit

    var notificationPayload map[string]interface{}
    if err := c.ShouldBindJSON(&notificationPayload); err != nil {
        fmt.Println("Webhook Error: Could not bind JSON payload.", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification payload"})
        return
    }

    // Safely get all required fields from the payload
    orderId, _ := notificationPayload["order_id"].(string)
    statusCode, _ := notificationPayload["status_code"].(string)
    grossAmount, _ := notificationPayload["gross_amount"].(string)
    signatureKey, _ := notificationPayload["signature_key"].(string)
    transactionStatus, _ := notificationPayload["transaction_status"].(string)

    fmt.Printf("Received Order ID: %s, Status: %s\n", orderId, transactionStatus)

    // --- Signature Key Verification ---
    serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
    stringToHash := orderId + statusCode + grossAmount + serverKey
    
    hasher := sha512.New()
    hasher.Write([]byte(stringToHash))
    
    calculatedHash := hex.EncodeToString(hasher.Sum(nil))

    fmt.Printf("Comparing Hashes:\n  - Signature from Midtrans: %s\n  - Calculated Signature: %s\n", signatureKey, calculatedHash)

    if calculatedHash != signatureKey {
        fmt.Println("Webhook Error: Invalid signature.")
        c.JSON(http.StatusForbidden, gin.H{"error": "Invalid signature"})
        return
    }
    
    fmt.Println("Webhook Signature is VALID.")

    if transactionStatus == "capture" || transactionStatus == "settlement" {
        fmt.Printf("Processing successful payment for Order ID: %s\n", orderId)
        
        parts := strings.Split(orderId, "-")
        if len(parts) < 2 {
            fmt.Println("Webhook Error: Could not parse subscription ID from order_id.")
            c.JSON(http.StatusOK, gin.H{"message": "OK, but order ID format is incorrect."})
            return
        }

        subscriptionID, err := strconv.Atoi(parts[1])
        if err != nil {
            fmt.Println("Webhook Error: Could not convert subscription ID to int.", err)
            c.JSON(http.StatusOK, gin.H{"message": "OK, but could not parse subscription ID."})
            return
        }

        sqlStatement := `UPDATE subscriptions SET status = 'active' WHERE id = $1 AND status = 'pending'`
        result, err := database.DB.Exec(context.Background(), sqlStatement, subscriptionID)
        if err != nil {
            fmt.Println("Webhook Error: Database update failed.", err)
            c.JSON(http.StatusOK, gin.H{"message": "OK, but DB update failed."})
            return
        }

        if result.RowsAffected() > 0 {
            fmt.Printf("SUCCESS: Subscription %d activated.\n", subscriptionID)
        } else {
            fmt.Printf("INFO: No 'pending' subscription found to activate for ID %d.\n", subscriptionID)
        }
    }
		
    c.JSON(http.StatusOK, gin.H{"message": "Notification processed successfully."})
}
