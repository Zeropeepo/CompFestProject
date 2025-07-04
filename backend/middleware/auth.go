package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"context"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/Zeropeepo/sea-catering-backend/database"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token not found"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Extract claims and pass UserID to the context 
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if userIDFloat, ok := claims["sub"].(float64); ok {
				userID := int(userIDFloat)
				c.Set("userID", userID)
			} else {
                c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID in token"})
                return
            }

            // Perform CSRF check for state-changing methods
            if c.Request.Method != "GET" {
                headerCsrf := c.GetHeader("X-CSRF-Token")
                claimCsrf, ok := claims["csrf"].(string)
                if !ok || headerCsrf == "" || headerCsrf != claimCsrf {
                    c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "CSRF token mismatch"})
                    return
                }
            }
		} else {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Could not parse token claims"})
            return
        }

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        AuthMiddleware()(c)
        if c.IsAborted() {
            return
        }

        userID, _ := c.Get("userID")
        var role string

        err := database.DB.QueryRow(context.Background(), "SELECT role FROM users WHERE id = $1", userID).Scan(&role)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not verify user role"})
            return
        }

        if role != "admin" {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
            return
        }

        // Proceed handler if all check are done
        c.Next()
    }
}