package main

import (
	"context"
	"fmt"
	"log"
	"github.com/Zeropeepo/sea-catering-backend/database"
	"github.com/Zeropeepo/sea-catering-backend/handlers"
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
	defer database.DB.Close(context.Background())

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"} 
	config.AllowMethods = []string{"POST", "GET", "OPTIONS"}
	router.Use(cors.New(config))

	api := router.Group("/api")
	{
		api.POST("/subscribe", handlers.SubscribeHandler)
		api.POST("/testimonials", handlers.CreateTestimonialsHandler)
		api.GET("/testimonials", handlers.GetTestimonialsHandler)
		api.POST("/register", handlers.RegisterHandler)
		api.POST("/login", handlers.LoginHandler)
	}

	fmt.Println("Backend server is running on http://localhost:8080")
	router.Run(":8080")
}