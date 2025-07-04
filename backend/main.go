package main

import (
	"fmt"
	"log"

	"github.com/Zeropeepo/sea-catering-backend/database"
	"github.com/Zeropeepo/sea-catering-backend/handlers"
	"github.com/Zeropeepo/sea-catering-backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// CONNECT DATABASE
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer database.DB.Close()

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "X-CSRF-Token"}
	router.Use(cors.New(config))

	api := router.Group("/api")
	{
		api.GET("/testimonials", handlers.GetTestimonialsHandler)
		api.POST("/register", handlers.RegisterHandler)
		api.POST("/login", handlers.LoginHandler)
	}

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/subscribe", handlers.SubscribeHandler)
		protected.POST("/testimonials", handlers.CreateTestimonialsHandler)
		protected.GET("/me", handlers.GetUserProfileHandler)
		protected.GET("/subscriptions", handlers.GetUserSubscriptionsHandler)
		protected.PUT("/subscriptions/:id/status", handlers.UpdateSubscriptionStatusHandler)
		protected.POST("/subscriptions/:id/ai-recommendation", handlers.GetAIRecommendationHandler)

		protected.POST("/midtrans/notification", handlers.MidtransNotificationHandler)
		protected.POST("/subscriptions/:id/create-payment", handlers.CreatePaymentHandler)
	}

	admin := api.Group("/admin")
	admin.Use(middleware.AdminMiddleware()) // Protect this whole group
	{
		admin.GET("/dashboard-stats", handlers.GetAdminDashboardHandler)
	}

	fmt.Println(`Backend server is running on ${import.meta.env.VITE_DEPLOY_API_URL}`)
	router.Run(":8080")
}
