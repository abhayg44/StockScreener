package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/comms"
	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/streadway/amqp"
)

var GoStockServiceURL = configs.GetConfig().GoStockServiceURL
var amqpURL = configs.GetConfig().AmqpURL

func PublishStockScreenerJob() (time.Time, error) {
	conn, err := amqp.Dial(amqpURL)
	comms.FailOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()
	ch, err := conn.Channel()
	comms.FailOnError(err, "Failed to open a channel")
	defer ch.Close()

	// Purging the old data in result queue
	_, err = ch.QueuePurge("final_stock_screener_result", false)
	if err != nil {
		fmt.Println("Warning: Failed to purge result queue:", err)
	} else {
		fmt.Println("Purged final_stock_screener_result queue")
	}

	q, err := ch.QueueDeclare(
		"stock_screener_run_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	comms.FailOnError(err, "Failed to declare a queue")
	curTime := time.Now().UTC()
	err = ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte("run"),
		},
	)
	comms.FailOnError(err, "Failed to publish a message")
	fmt.Println("Message published to queue")
	return curTime, nil
}

func GetStockFromRabbitmq(curTime time.Time) (models.StockData, error) {
	var stockData models.StockData
	conn, err := amqp.Dial(amqpURL)
	comms.FailOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()
	ch, err := conn.Channel()
	comms.FailOnError(err, "Failed to open a channel")
	defer ch.Close()
	q, err := ch.QueueDeclare(
		"final_stock_screener_result",
		true,
		false,
		false,
		false,
		nil,
	)
	comms.FailOnError(err, "Failed to declare a queue")
	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	comms.FailOnError(err, "Failed to register a consumer")
	// Wait for fresh data with 20-second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	for {
		select {
		case d := <-msgs:
			err := json.Unmarshal(d.Body, &stockData)
			fmt.Println("stockData is ", stockData)
			if stockData.LastUpdated.Before(curTime) {
				fmt.Println("Received outdated stock data, ignoring and waiting for fresh data...")
				continue
			}
			if err != nil {
				return models.StockData{}, err
			}
			fmt.Println("Received fresh stock data from RabbitMQ", stockData)
			return stockData, nil

		case <-ctx.Done():
			fmt.Println("Timeout reached waiting for fresh stock data")
			return models.StockData{}, fmt.Errorf("timeout: fresh stock data not received within 20 seconds")
		}
	}
}

// func GetStocksFromPython(frequency string) (models.StockData, error) {
// 		client := http.Client{Timeout: 10 * time.Second}
//     url := fmt.Sprintf("%s/stocks/%s", GoStockServiceURL,frequency)

//     resp, err := client.Get(url)
//     if err != nil {
//         return models.StockData{}, err
//     }
//     defer resp.Body.Close()

//     var stocks models.StockData
//     if err := json.NewDecoder(resp.Body).Decode(&stocks); err != nil {
//         return models.StockData{}, err
//     }
//     return stocks, nil
// }
