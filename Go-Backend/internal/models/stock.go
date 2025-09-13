package models

import "time"

type StrategyData struct {
	Ticker string  `json:"Ticker" bson:"ticker"`
	Score  float64 `json:"score" bson:"score"`
}

type StrategyResult struct {
	Bullish []StrategyData `json:"bullish" bson:"bullish"`
	Bearish []StrategyData `json:"bearish" bson:"bearish"`
}

type StockData struct {
	MA50   StrategyResult `json:"ma50" bson:"ma50"`
	RSI    StrategyResult `json:"rsi" bson:"rsi"`
	Volume StrategyResult `json:"volume" bson:"volume"`
	Final  StrategyResult `json:"combined" bson:"combined"`
}

type CompanyName struct {
	Company_name string `bson:"Company Name" json:"Company Name"`
	Symbol       string `bson:"Symbol" json:"Symbol"`
}

type Job struct {
	Stock_list     []string    `bson:"stock_list" json:"stock_list"`
	Company_names []CompanyName `bson:"company_names" json:"company_names"`
	PushedAt       time.Time   `bson:"pushed_at" json:"pushed_at"`
}
