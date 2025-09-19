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

    func PublishStockScreenerJob() error{
        conn,err:=amqp.Dial(amqpURL)
        comms.FailOnError(err, "Failed to connect to RabbitMQ")
        defer conn.Close()
        ch,err:=conn.Channel()
        comms.FailOnError(err, "Failed to open a channel")
        defer ch.Close()
        q,err:=ch.QueueDeclare(
            "stock_screener_run_queue",
            true,
            false,
            false,
            false,
            nil,
        )
        comms.FailOnError(err, "Failed to declare a queue")
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
        comms.FailOnError(err, "Failed to publish a message")
        fmt.Println("Message published to queue")
        return nil
    }


    func GetStockFromRabbitmq() (models.StockData, error) {
        var stockData models.StockData
        conn,err:=amqp.Dial(amqpURL)
        comms.FailOnError(err, "Failed to connect to RabbitMQ")
        defer conn.Close()
        ch,err:=conn.Channel()
        comms.FailOnError(err, "Failed to open a channel")
        defer ch.Close()
        q,err:=ch.QueueDeclare(
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
        ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
        defer cancel()

        for {
            select{
            case d:=<-msgs:
                err:=json.Unmarshal(d.Body, &stockData)
                if err != nil {
                    return models.StockData{}, err
                }
                fmt.Println("Received a message from RabbitMQ", stockData)
                return stockData, nil

            case <-ctx.Done():
                fmt.Println("Timeout reached, exiting...")
                return stockData, nil
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