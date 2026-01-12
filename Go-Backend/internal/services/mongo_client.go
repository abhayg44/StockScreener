package services

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoURL = configs.GetConfig().MongoURL

var (
	client    *mongo.Client
	mongoOnce sync.Once
)

func InitMongo(uri string) {
	mongoOnce.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		clientOptions := options.Client().
			ApplyURI(MongoURL).
			SetMaxPoolSize(10).
			SetMinPoolSize(2).
			SetConnectTimeout(5 * time.Second)
		var err error
		client, err = mongo.Connect(ctx, clientOptions)
		if err != nil {
			panic(err)
		}
		if err = client.Ping(ctx, nil); err != nil {
			_ = client.Disconnect(context.Background())
			panic(err)
		}
		fmt.Println("connection successful", client)
	})
}

func GetMongoCollection(databaseName, collectionName string) *mongo.Collection {
	if client == nil {
		InitMongo(MongoURL)
	}
	return client.Database(databaseName).Collection(collectionName)
}

func DisconnectMongo(ctx context.Context) error {
	if client == nil {
		return nil
	}
	err := client.Disconnect(ctx)
	client = nil
	return err
}
