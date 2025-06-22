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

func SubscribeHandler(c *gin.Context) {
	var sub Subscription

	if err := c.ShouldBindJSON(&sub); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}

	sqlStatement := `
		INSERT INTO subscriptions (name, phone_number, plan_name, meal_types, delivery_days, allergies, total_price)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
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
	).Scan(&id)

	if err != nil {

		fmt.Fprintf(c.Writer, "Error inserting subscription: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Subscription created successfully!",
		"subscriptionId": id,
	})
}
