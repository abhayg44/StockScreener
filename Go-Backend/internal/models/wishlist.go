package models

import (
	"time"
)

type WishlistData struct {
    UserID     int       `json:"user_id" bson:"user_id"`
    Ticker     string    `json:"ticker" bson:"ticker"`
    Name       string    `json:"name" bson:"name"`
    ClosePrice float64   `json:"close_price" bson:"close_price"`
    Change     float64   `json:"change" bson:"change"`
    CreatedAt  time.Time `json:"created_at" bson:"created_at"`
}