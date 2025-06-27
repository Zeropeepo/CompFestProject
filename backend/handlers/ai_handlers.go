// File: backend/handlers/ai_handlers.go
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv" // <-- 1. IMPORT strconv TO CONVERT THE ID FROM STRING TO INT
	"strings"

	"github.com/Zeropeepo/sea-catering-backend/database"
	"github.com/gin-gonic/gin"
	"google.golang.org/genai"
)

// 2. THIS STRUCT IS NO LONGER NEEDED as the ID is not in the request body.
// type AIRecommendationRequest struct {
// 	SubscriptionID int `json:"subscriptionId" binding:"required"`
// }

// Struct to match the expected JSON output from the AI
type AIRecommendation struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func GetAIRecommendationHandler(c *gin.Context) {
	// 3. GET THE SUBSCRIPTION ID FROM THE URL PARAMETER
	subscriptionIDStr := c.Param("id")
	subscriptionID, err := strconv.Atoi(subscriptionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID format"})
		return
	}

	// Verify the user owns this subscription
	userID, _ := c.Get("userID")
	var planName, allergies string
	// 4. USE THE 'subscriptionID' VARIABLE FROM THE URL IN THE QUERY
	err = database.DB.QueryRow(context.Background(),
		"SELECT plan_name, allergies FROM subscriptions WHERE id = $1 AND user_id = $2",
		subscriptionID, userID).Scan(&planName, &allergies)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found or you do not have permission"})
		return
	}

	geminiAPIKey := os.Getenv("GEMINI_API_KEY")
	if geminiAPIKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service is not configured"})
		return
	}

	if allergies == "" {
		allergies = "None"
	}

	// --- The rest of the function remains the same ---

	ctx := context.Background()
	client, _ := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("GEMINI_API_KEY"),
		Backend: genai.BackendGeminiAPI,
	})

	prompt := fmt.Sprintf(
		"You are a helpful nutritionist for a healthy food delivery service in Indonesia. "+
			"A user is subscribed to our '%s' meal plan and has the following allergies/restrictions: '%s'. "+
			"Please recommend 5 specific and appealing random dishes from (Indonesia,Western,Europe) that would be suitable for them. "+
			"IMPORTANT: Your entire response must be ONLY a single, valid JSON array of objects. Do not include any introductory text or markdown formatting like ```json. "+
			"Each object in the array must have two keys: 'name' (the dish name) and 'description' (a brief, mouth-watering description). "+
			"Example format: [{\"name\": \"Gado-Gado Salad\", \"description\": \"A vibrant mix of fresh vegetables, tofu, and a rich peanut sauce, adapted to be safe for their allergies.\"}]",
		planName,
		allergies,
	)

	budget := int32(30)
	resp, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text(prompt),
		&genai.GenerateContentConfig{
			ThinkingConfig: &genai.ThinkingConfig{
				ThinkingBudget: &budget, // pointer to int32
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate content from AI service"})
		return
	}

	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		part := resp.Candidates[0].Content.Parts[0]

		var rawContent string
		if part.Text != "" {
			rawContent = part.Text
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service returned unexpected content type"})
			return
		}

		cleanContent := strings.TrimSpace(rawContent)
		cleanContent = strings.TrimPrefix(cleanContent, "```json")
		cleanContent = strings.TrimSuffix(cleanContent, "```")
		cleanContent = strings.TrimSpace(cleanContent)

		var recommendations []AIRecommendation
		err := json.Unmarshal([]byte(cleanContent), &recommendations)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service returned malformed data. " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, recommendations)
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service returned an empty or invalid response"})
}