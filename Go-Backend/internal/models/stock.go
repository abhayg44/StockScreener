package models

import (
	"time"
)

type StrategyData struct {
	Ticker        string  `json:"Ticker" bson:"ticker"`
	Score         float64 `json:"score" bson:"score"`
	Close         float64 `json:"close" bson:"close"`
	Change        float64 `json:"change" bson:"change"`
	PercentChange float64 `json:"pct_change" bson:"pct_change"`
	Name          string  `json:"name" bson:"name"`
}

type StrategyResult struct {
	Bullish []StrategyData `json:"bullish" bson:"bullish"`
	Bearish []StrategyData `json:"bearish" bson:"bearish"`
}

type StockData struct {
	MA50        StrategyResult `json:"ma50" bson:"ma50"`
	RSI         StrategyResult `json:"rsi" bson:"rsi"`
	Volume      StrategyResult `json:"volume" bson:"volume"`
	Final       StrategyResult `json:"combined" bson:"combined"`
	LastUpdated time.Time      `json:"last_updated" bson:"last_updated"`
}


