
package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect() error {
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	var err error
	
	DB, err = pgxpool.New(context.Background(), connStr)
	if err != nil {
		return fmt.Errorf("Unable to create connection pool: %v", err)
	}

	if err := DB.Ping(context.Background()); err != nil {
		return fmt.Errorf("Unable to ping database: %v", err)
	}

	fmt.Println("Successfully connected to the database pool!")
	return nil
}