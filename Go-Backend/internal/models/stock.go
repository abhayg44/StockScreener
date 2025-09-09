package models

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
