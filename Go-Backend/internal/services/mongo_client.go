package services

import (
	"context"
	"fmt"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoURL = configs.GetConfig().MongoURL

var client *mongo.Client

func initMongo(uri string){
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var err error
	client,err =mongo.Connect(ctx,options.Client().ApplyURI(uri))
	if err!=nil{
		panic(err)
	}
	if err = client.Ping(ctx,nil); err!=nil{
		_=client.Disconnect(context.Background())
		panic(err)
	}
	fmt.Println("connection successful",client)
}

func GetMongoCollection(databaseName,collectionName string) *mongo.Collection {
	if client==nil{
		initMongo(MongoURL)
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

var Cur_Stock_Data models.StockData
var max_iterations = 5
func StoreDataInMongo(databaseName,collectionName string,filter interface{},data interface{}) error {
	initMongo(MongoURL)
	collection := GetMongoCollection(databaseName, collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	opts := options.FindOne().SetSort(bson.D{{Key: "last_updated", Value: -1}})
	if err := collection.FindOne(ctx, bson.D{}, opts).Decode(&Cur_Stock_Data); err != nil {
		
	}
}