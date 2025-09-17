package api

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
)


var Cur_Stock_Data models.StockData
var wg sync.WaitGroup

func RefreshCurrentStockDataJob() error{
	wg.Add(1)

	go func ()  {
		defer wg.Done()
		err := services.PublishStockScreenerJob()
		if err != nil {
			fmt.Errorf("failed to run stock screener service: %w", err)
		}
	}()
	wg.Wait()
	Cur_Stock_Data, err := services.GetStockFromRabbitmq()
	if err != nil {
		return fmt.Errorf("failed to get stock data from RabbitMQ: %w", err)

	}
	fmt.Println("Updated stock data: ", Cur_Stock_Data)
	return nil
}



func RefreshCurrentStockData(w http.ResponseWriter, r *http.Request) {
	if err := RefreshCurrentStockDataJob(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Stock screener service triggered successfully"))
}


// func PostStockHandler(w http.ResponseWriter, r *http.Request) {
// 	var stocks models.StockData
// 	if err := json.NewDecoder(r.Body).Decode(&stocks); err != nil {
// 		http.Error(w, "Invalid request payload", http.StatusBadRequest)
// 		return
// 	}
// 	collection := services.GetMongoCollection("stocks", "stock_daily")
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()
// 	_, err := collection.ReplaceOne(ctx,
// 		map[string]string{"type": "daily"},
// 		stocks,
// 		options.Replace().SetUpsert(true),
// 	)
// 	if err != nil {
// 		http.Error(w, "Failed to insert stock data", http.StatusInternalServerError)
// 		return
// 	}
// 	w.WriteHeader(http.StatusCreated)
// 	w.Write([]byte("Stock data inserted successfully"))
// }

// func GetStockHandler(w http.ResponseWriter, r *http.Request) {
// 	frequency := r.URL.Query().Get("Frequency")
// 	if frequency == "" {
// 	frequency = "daily"
// 	}
// 	stocks, err := services.GetStocksFromPython(frequency)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch stock data from Python service", http.StatusInternalServerError)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(stocks)
// }