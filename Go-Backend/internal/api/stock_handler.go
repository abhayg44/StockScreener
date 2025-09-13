package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func failOnError(err error, msg string) error{
	if err != nil {
		panic(fmt.Sprintf("%s: %s", msg, err))
	}
	return err
}

var Cur_Stock_Data models.Job
var amqpURL = configs.GetConfig().AmqpURL
var max_iterations = 3

func RunStockScreenerService() error{
	conn,err:=amqp.Dial(amqpURL)
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

func WaitForStockUpdateAndFetch() (models.Job, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return Cur_Stock_Data, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return Cur_Stock_Data, fmt.Errorf("failed to open channel: %w", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"nifty50_ready_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return Cur_Stock_Data, fmt.Errorf("failed to declare queue: %w", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,  // auto-ack
		false, // exclusive
		false,
		false,
		nil,
	)
	if err != nil {
		return Cur_Stock_Data, fmt.Errorf("failed to consume messages: %w", err)
	}

	// Timeout context so it won't block forever
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for {
		select {
		case d := <-msgs:
			if string(d.Body) == "done" {
				fmt.Println("Got DONE from queue, fetching MongoDB data...")

				collection := services.GetMongoCollection("stock", "stock_data")
				dbCtx, dbCancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer dbCancel()

			opts := options.FindOne().SetSort(bson.D{{Key: "pushed_at", Value: -1}})
			if err := collection.FindOne(dbCtx, bson.D{}, opts).Decode(&Cur_Stock_Data); err != nil {
					if Cur_Stock_Data.PushedAt.Sub(time.Now()) > -5*time.Minute && max_iterations > 0 {
						RefreshCurrentStockDataJob()
						max_iterations--
						return Cur_Stock_Data, fmt.Errorf("data not updated yet, retrying... remaining attempts: %d", max_iterations)
					}
					return Cur_Stock_Data, fmt.Errorf("failed to decode Mongo stock data: %w", err)
				}
				return Cur_Stock_Data, nil
			} else {
				fmt.Println("Got message but not DONE: ", string(d.Body))
			}

		case <-ctx.Done():
			return Cur_Stock_Data, fmt.Errorf("timeout waiting for DONE message")
		}
	}
}


func RefreshCurrentStockDataJob() error{
	if err := RunStockScreenerService(); err != nil {
		return fmt.Errorf("failed to run stock screener service: %w", err)
	}

	data, err := WaitForStockUpdateAndFetch()
	if err != nil {
		return fmt.Errorf("failed to fetch updated stock data: %w", err)
	}
	fmt.Println("Updated stock data: ", data,"Current stock data is ",Cur_Stock_Data)
	return nil
}


func RefreshCurrentStockDataHandler(w http.ResponseWriter, r *http.Request) {
	if err := RefreshCurrentStockDataJob(); err != nil {
		http.Error(w, "Failed to run stock screener service", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Stock screener service triggered successfully"))
}


