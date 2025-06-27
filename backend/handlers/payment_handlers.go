package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv" 
	"time"

	"github.com/Zeropeepo/sea-catering-backend/database"
	"github.com/gin-gonic/gin"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)



// Global snap client, initiated with the server key and environment
var s snap.Client

func init() {
	s.New(os.Getenv("MIDTRANS_SERVER_KEY"), midtrans.Sandbox)
}

func CreatePaymentHandler(c *gin.Context) {
	subscriptionIDStr := c.Param("id")
	subscriptionID, err := strconv.Atoi(subscriptionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID format"})
		return
	}

	// Grab userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User context not found"})
		return
	}

	var user UserProfile
	var subscriptionAmount float64
	var subscriptionPlan string

	// Get user profile from database using userID
	err = database.DB.QueryRow(context.Background(),
		"SELECT id, full_name, email FROM users WHERE id = $1", userID.(int)).Scan(&user.ID, &user.FullName, &user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User profile not found"})
		return
	}

	// Get subscription details from database
	err = database.DB.QueryRow(context.Background(),
		"SELECT plan_name, total_price FROM subscriptions WHERE id = $1 AND user_id = $2", subscriptionID, userID.(int)).Scan(&subscriptionPlan, &subscriptionAmount)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or you do not have permission"})
		return
	}

	// Request structure for Midtrans Snap
	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  fmt.Sprintf("SEACATERING-%d-%d", subscriptionID, time.Now().Unix()),
			GrossAmt: int64(subscriptionAmount),
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: user.FullName,
			Email: user.Email,
		},
		Items: &[]midtrans.ItemDetails{
			{
				ID:    "SUB-" + strconv.Itoa(subscriptionID),
				Price: int64(subscriptionAmount),
				Qty:   1,
				Name:  "Subscription: " + subscriptionPlan,
			},
		},
	}

	// Create snap token
	snapToken, midtransErr := s.CreateTransactionToken(snapReq)
	if midtransErr != nil {
		fmt.Printf("Error creating Midtrans transaction: %v\n", midtransErr.GetMessage())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment transaction"})
		return
	}

	// Send the snap token back to the client
	c.JSON(http.StatusOK, gin.H{
		"snapToken": snapToken,
	})
}
