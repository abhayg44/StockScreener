package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Cur_Stock_Data models.StockData
var MongoURL = configs.GetConfig().MongoURL

func RefreshCurrentStockDataJob() (models.StockData, error) {
	curTime, err := services.PublishStockScreenerJob()
	if err != nil {
		return models.StockData{}, fmt.Errorf("failed to publish stock screener job: %w", err)
	}
	fmt.Println("Published run job to RabbitMQ at", curTime)

	// Wait for fresh stock data from RabbitMQ
	Cur_Stock_Data, err := services.GetStockFromRabbitmq(curTime)
	if err != nil {
		return models.StockData{}, fmt.Errorf("failed to get stock data from RabbitMQ: %w", err)
	}
	fmt.Println("Received stock data from RabbitMQ: ", Cur_Stock_Data)
	StoreDataInMongo("stock", "stock_data", bson.M{"type": "latest"}, Cur_Stock_Data)
	fmt.Println("Stored stock data in MongoDB")
	return Cur_Stock_Data, nil
}

func RefreshCurrentStockData(w http.ResponseWriter, r *http.Request) {
	Cur_Stock_Data, err := RefreshCurrentStockDataJob()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Println("Stock data refreshed successfully ", Cur_Stock_Data)
	if err := json.NewEncoder(w).Encode(Cur_Stock_Data); err != nil {
		http.Error(w, "Failed to encode stock data", http.StatusInternalServerError)
		return
	}
}

func StoreDataInMongo(databaseName, collectionName string, filter interface{}, data interface{}) error {
	services.InitMongo(MongoURL)
	collection := services.GetMongoCollection(databaseName, collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, data)
	if err != nil {
		return fmt.Errorf("failed to insert stock data: %w", err)
	}
	print("Inserted stock data into MongoDB")
	opts := options.Find().SetSort(bson.D{{Key: "last_updated", Value: -1}})
	cursor, err := collection.Find(ctx, bson.D{}, opts)
	if err != nil {
		return fmt.Errorf("failed to find stock data: %w", err)
	}
	defer cursor.Close(ctx)
	var docs []bson.M
	if err = cursor.All(ctx, &docs); err != nil {
		return fmt.Errorf("failed to decode stock data: %w", err)
	}
	print("Found stock data: ", docs)
	if len(docs) > 4 {
		var idsToKeep []interface{}
		for i := 0; i < 4; i++ {
			idsToKeep = append(idsToKeep, docs[i]["_id"])
		}
		_, err = collection.DeleteMany(ctx, bson.M{"_id": bson.M{"$nin": idsToKeep}})
		if err != nil {
			return fmt.Errorf("failed to delete old stock data: %w", err)
		}
	}
	return nil
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
