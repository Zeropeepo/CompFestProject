package handlers

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Zeropeepo/sea-catering-backend/database"
)

type Testimonials struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Review string `json:"review"`
	Rating int    `json:"rating"`
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