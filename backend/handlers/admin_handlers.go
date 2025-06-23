package handlers

import (
	"context"
	"net/http"
    "time"

	"github.com/gin-gonic/gin"
	"github.com/Zeropeepo/sea-catering-backend/database"
)

// --- Structs ---
type AdminDashboardData struct {
    NewSubscriptions        int     `json:"newSubscriptions"`
    MonthlyRecurringRevenue float64 `json:"monthlyRecurringRevenue"`
    ActiveSubscriptions     int     `json:"activeSubscriptions"`
    Reactivations           int     `json:"reactivations"`
    GrowthData              []GrowthDataPoint `json:"growthData"` 
}

type GrowthDataPoint struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}


// --- Handlers ---

func GetAdminDashboardHandler(c *gin.Context) {
    defaultEndDate := time.Now()
    defaultStartDate := defaultEndDate.AddDate(0, -1, 0)

    startDateStr := c.DefaultQuery("startDate", defaultStartDate.Format("2006-01-02"))
    endDateStr := c.DefaultQuery("endDate", defaultEndDate.Format("2006-01-02"))

    layout := "2006-01-02"
    startDate, err := time.Parse(layout, startDateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format."})
        return
    }
    endDate, err := time.Parse(layout, endDateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format."})
        return
    }
    endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

    var data AdminDashboardData

    // 1. New Subscriptions Query (with proper error checking)
    newSubsQuery := `SELECT COUNT(*) FROM subscriptions WHERE created_at >= $1 AND created_at <= $2;`
    err = database.DB.QueryRow(context.Background(), newSubsQuery, startDate, endDate).Scan(&data.NewSubscriptions)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query new subscriptions"})
        return
    }

    // 2. MRR Query (with proper error checking)
    mrrQuery := `SELECT COALESCE(SUM(total_price), 0) FROM subscriptions WHERE status = 'active' AND created_at >= $1 AND created_at <= $2;`
    err = database.DB.QueryRow(context.Background(), mrrQuery, startDate, endDate).Scan(&data.MonthlyRecurringRevenue)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query MRR"})
        return
    }

    // 3. Active Subscriptions Query (with proper error checking)
    activeSubsQuery := `SELECT COUNT(*) FROM subscriptions WHERE status = 'active';`
    err = database.DB.QueryRow(context.Background(), activeSubsQuery).Scan(&data.ActiveSubscriptions)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query active subscriptions"})
        return
    }

    // 4. Reactivations Query (with proper error checking)
    reactivationsQuery := `SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND updated_at >= $1 AND updated_at <= $2 AND created_at < updated_at;`
    err = database.DB.QueryRow(context.Background(), reactivationsQuery, startDate, endDate).Scan(&data.Reactivations)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query reactivations"})
        return
    }

    // 5. Growth Data Query (with proper error checking)
    growthQuery := `
        SELECT to_char(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count
        FROM subscriptions
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY date
        ORDER BY date ASC;
    `
    rows, err := database.DB.Query(context.Background(), growthQuery, startDate, endDate)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch growth data"})
        return
    }
    defer rows.Close()

    growthData := make([]GrowthDataPoint, 0)
    for rows.Next() {
        var point GrowthDataPoint
        if err := rows.Scan(&point.Date, &point.Count); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process growth data"})
            return
        }
        growthData = append(growthData, point)
    }
    data.GrowthData = growthData

    c.JSON(http.StatusOK, data)
}











