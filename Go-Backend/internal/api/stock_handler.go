package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func RunStockScreenerService() {
	conn,err:=amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err!=nil{
		panic(err)
	}
	defer conn.Close()
	ch,err:=conn.Channel()
	if err!=nil{
		panic(err)
	}
	defer ch.Close()
	q,err:=ch.QueueDeclare(
		"stock_screener_run_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err!=nil{
		panic(err)
	}
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
	if err!=nil{
		panic(err)
	}
	fmt.Println("Message published to queue")
}

func PostStockHandler(w http.ResponseWriter, r *http.Request) {
	var stocks models.StockData
	if err := json.NewDecoder(r.Body).Decode(&stocks); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	collection := services.GetMongoCollection("stocks", "stock_daily")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := collection.ReplaceOne(ctx,
		map[string]string{"type": "daily"},
		stocks,
		options.Replace().SetUpsert(true),
	)
	if err != nil {
		http.Error(w, "Failed to insert stock data", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Stock data inserted successfully"))
}

func GetStockHandler(w http.ResponseWriter, r *http.Request) {
	frequency := r.URL.Query().Get("Frequency")
	if frequency == "" {
	frequency = "daily"
	}
	stocks, err := services.GetStocksFromPython(frequency)
	if err != nil {
		http.Error(w, "Failed to fetch stock data from Python service", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stocks)
}