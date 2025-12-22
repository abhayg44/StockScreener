package models

import "time"

type StockDiaryEntry struct {
	ID            string  `json:"id" bson:"_id,omitempty"`
	UserID        string  `json:"user_id" bson:"user_id"`
	StockSymbol   string  `json:"stock_symbol" bson:"stock_symbol"`
	EntryPrice    float64 `json:"entry_price" bson:"entry_price"`
	ExitPrice     float64 `json:"exit_price" bson:"exit_price"`
	EntryDateTime string  `json:"entry_time" bson:"entry_time"`
	ExitDateTime  string  `json:"exit_time" bson:"exit_time"`
	Description   string  `json:"description" bson:"description"`
	CreatedAt     time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" bson:"updated_at"`
}