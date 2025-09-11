package api

import (
	"fmt"
	"net/http"

	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) error{
	if err != nil {
		panic(fmt.Sprintf("%s: %s", msg, err))
	}
	return err
}

var Cur_Stock_Data models.StockData

func RunStockScreenerService() error{
	conn,err:=amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()
	ch,err:=conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()
	q,err:=ch.QueueDeclare(
		"stock_screener_run_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to declare a queue")
	err=ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:       []byte("run"),
		},
	)
	failOnError(err, "Failed to publish a message")
	fmt.Println("Message published to queue")
	return nil
}

func RefreshCurrentStockData(w http.ResponseWriter, r *http.Request) {
	err := RunStockScreenerService()
	if err != nil {
		http.Error(w, "Failed to run stock screener service", http.StatusInternalServerError)
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