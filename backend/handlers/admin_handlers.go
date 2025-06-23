package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Zeropeepo/sea-catering-backend/database"
)

// --- Structs ---
type AdminDashboardData struct {
    NewSubscriptions        int     `json:"newSubscriptions"`
    MonthlyRecurringRevenue float64 `json:"monthlyRecurringRevenue"`
    ActiveSubscriptions     int     `json:"activeSubscriptions"`
    Reactivations           int     `json:"reactivations"` 
}


// --- Handlers ---

func GetAdminDashboardHandler(c *gin.Context) {
    var data AdminDashboardData

    // Get Subscription Count
    newSubsQuery := `SELECT COUNT(*) FROM subscriptions;`
    _ = database.DB.QueryRow(context.Background(), newSubsQuery).Scan(&data.NewSubscriptions)

    // Get Monthly Recurring Revenue
    mrrQuery := `SELECT COALESCE(SUM(total_price), 0) FROM subscriptions WHERE status = 'active';`
    _ = database.DB.QueryRow(context.Background(), mrrQuery).Scan(&data.MonthlyRecurringRevenue)

    // Get Active Subscriptions
    activeSubsQuery := `SELECT COUNT(*) FROM subscriptions WHERE status = 'active';`
    _ = database.DB.QueryRow(context.Background(), activeSubsQuery).Scan(&data.ActiveSubscriptions)
    
    //  Get Reactivations (Mock data for now)
    data.Reactivations = 0 

    c.JSON(http.StatusOK, data)
}












