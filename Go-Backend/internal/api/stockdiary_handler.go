package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetStockDiaryEntry(UserId string)([]models.StockDiaryEntry,error){
	services.InitMongo(MongoURL)
	collection:=services.GetMongoCollection("stock","stock_diary")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter:=bson.M{"user_id":UserId}
	cursor,err:=collection.Find(ctx,filter)
	if err!=nil{
		return nil,fmt.Errorf("Failed to find stock diary entries: %v", err)
	}
	defer cursor.Close(ctx)
	var entries []models.StockDiaryEntry
	for cursor.Next(ctx){
		var entry models.StockDiaryEntry
		if err:=cursor.Decode(&entry); err!=nil{
			return nil,fmt.Errorf("Failed to decode stock diary entry: %v", err)
		}
		entries=append(entries,entry)
	}
	if err:=cursor.Err(); err!=nil{
		return nil,fmt.Errorf("Cursor error: %v", err)
	}
	return entries,nil
}

func GetStockDiaryEntryPagination(UserId string, page int, limit int) ([]models.StockDiaryEntry, int64, error) {
	services.InitMongo(MongoURL)
	collection := services.GetMongoCollection("stock", "stock_diary")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	skip := (page - 1) * limit
	filter := bson.M{"user_id": UserId}
	findOptions := options.Find().SetSort(bson.D{{"created_at", -1}})
	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count documents: %v", err)
	}
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil,0,fmt.Errorf("Failed to find stock diary entries: %v", err)
	}
	defer cursor.Close(ctx)
	var entries []models.StockDiaryEntry
	for cursor.Next(ctx) {
		var entry models.StockDiaryEntry
		if err := cursor.Decode(&entry); err != nil {
			return nil,0,fmt.Errorf("Failed to decode stock diary entry: %v", err)
		}
		entries = append(entries, entry)
	}
	if err := cursor.Err(); err != nil {
		return nil,0,fmt.Errorf("Cursor error: %v", err)
	}
	return entries, count, nil
}

func GetParticularStockDiaryEntry(UserId string,id primitive.ObjectID)(models.StockDiaryEntry,error){
	services.InitMongo(MongoURL)
	fmt.Println("inside getparticular data")
	collection:=services.GetMongoCollection("stock","stock_diary")
	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	filter:=bson.M{"user_id":UserId,"_id":id}
	var entry models.StockDiaryEntry
	err:=collection.FindOne(ctx,filter).Decode(&entry)
	if err!=nil{
		if err==mongo.ErrNoDocuments{
			return models.StockDiaryEntry{},nil
		}
		return models.StockDiaryEntry{},fmt.Errorf("Failed to find the stock diary entry: %v",err)
	}
	return entry,nil
}

func GetStockDiaryEntryHandler(w http.ResponseWriter, r *http.Request){
	entries,err:=GetStockDiaryEntry(r.URL.Query().Get("user_id"))
	if err!=nil{
		http.Error(w,err.Error(),http.StatusInternalServerError)
		data:=models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "Failed to get stock diary entries",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return 
	}
	data:=models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entries fetched successfully",
		Data:       entries,
		Error:      "",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

func GetStockDiaryPaginationHandler(w http.ResponseWriter, r *http.Request){
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	var page, limit int
	if pageStr == "" {
		page = 1
	} else {
		fmt.Sscanf(pageStr, "%d", &page)
	}
	if limitStr == "" {
		limit = 3
	} else {
		fmt.Sscanf(limitStr, "%d", &limit)
	}
	entries, count, err := GetStockDiaryEntryPagination(r.URL.Query().Get("user_id"), page, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		data := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "Failed to get stock diary entries",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	data := models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entries fetched successfully",
		Data:       map[string]interface{}{ "entries": entries, "total_count": count },
		Error:      "",	
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

func GetParticularStockDiaryEntryHandler(w http.ResponseWriter, r *http.Request){
	fmt.Println("request url ",r.URL.String())
	fmt.Println("id is ",strings.Split(strings.Split(r.URL.String(), "/")[2], "?")[0])
	id_str := strings.Split(strings.Split(r.URL.String(), "/")[2], "?")[0]
	id,err:=primitive.ObjectIDFromHex(id_str)
	if err!=nil{
		http.Error(w,"Invalid ID format",http.StatusBadRequest)
		data:=models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid ID format",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return 
	}
	UserId:=r.URL.Query().Get("user_id")
	fmt.Println("diary id is ",id," user id is ",UserId)
	entry,err:=GetParticularStockDiaryEntry(UserId,id)
	if err!=nil{
		http.Error(w,err.Error(),http.StatusInternalServerError)
		data:=models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return 
	}
	if entry.ID==""{
		data:=models.ResponseStruct{
			StatusCode: http.StatusOK,
			Message:    "No entry found for the given ID",
			Data:       []models.StockDiaryEntry{},
			Error:      "",
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(data)
		return
	}
	data:=models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entry fetched successfully",
		Data:       entry,
		Error:      "",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

func StoreStockDiaryEntry(entry models.StockDiaryEntry) (error) {
	services.InitMongo(MongoURL)
	fmt.Println("inside the store stock diary function")
	collection := services.GetMongoCollection("stock", "stock_diary")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	res, err := collection.InsertOne(ctx, entry)
	fmt.Println("response is ",res)
	if err != nil {
		log.Fatalf("Error storing the stock diary entry %v", err)
		return err
	} else {
		fmt.Printf("successfull %v", res)
		return nil
	}
}

func StoreStockDiaryEntryHandler(w http.ResponseWriter, r *http.Request){
	var entry models.StockDiaryEntry
	b,err:=r.Body.Read([]byte{})
	fmt.Println("body bytes are ",b, err)
	if err:=json.NewDecoder(r.Body).Decode(&entry); err!=nil{
		w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(models.ResponseStruct{
            StatusCode: http.StatusBadRequest,
            Message:    "Invalid request payload",
            Data:       nil,
            Error:      err.Error(),
        })
        return
	}
	fmt.Println("entry from node is ",entry)
	if err:=StoreStockDiaryEntry(entry); err!=nil{
		w.WriteHeader(http.StatusInternalServerError)
    json.NewEncoder(w).Encode(models.ResponseStruct{
        StatusCode: http.StatusInternalServerError,
        Message:    "Failed to store stock diary entry",
        Data:       nil,
        Error:      err.Error(),
        })
        return
	}
	data:=models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entry stored successfully",
		Data:       entry,
		Error:      "",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}


func EditStockDiaryEntry(id primitive.ObjectID, updatedEntry models.StockDiaryEntry, userId string) error {
	services.InitMongo(MongoURL)
	collection:=services.GetMongoCollection("stock", "stock_diary")
	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	filter:=bson.M{"_id":id,"user_id":userId}
	update:=bson.M{"$set":bson.M{
		"stock_symbol":   updatedEntry.StockSymbol,
		"entry_price":  updatedEntry.EntryPrice,
		"exit_price":   updatedEntry.ExitPrice,
		"entry_time":   updatedEntry.EntryDateTime,
		"exit_time":    updatedEntry.ExitDateTime,
		"description":     updatedEntry.Description,
		"updated_at":       updatedEntry.UpdatedAt,
	}}
	_,err:=collection.UpdateOne(ctx,filter,update)
	if err!=nil{
		log.Fatalf("Error updating the stock diary entry %v",err)
		return err
	}else{
		fmt.Println("Stock diary entry updated successfully")
		return nil
	}
}

func EditStockDiaryEntryHandler(w http.ResponseWriter, r *http.Request){
	var updatedEntry models.StockDiaryEntry
	if err:=json.NewDecoder(r.Body).Decode(&updatedEntry); err!=nil{
		http.Error(w,"Invalid request payload",http.StatusBadRequest)
		data:=models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request payload",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	userId := r.URL.Query().Get("user_id")
	id_str := strings.Split(strings.Split(r.URL.String(), "/")[2], "?")[0]
	id, err := primitive.ObjectIDFromHex(id_str)
	fmt.Println("user id is ", userId, " id is ", id)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		data := models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid ID format",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	entry, err := GetParticularStockDiaryEntry(userId, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		data := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	fmt.Println("---------------------------------------- data is ",entry)
	if entry.ID == "" {
		data := models.ResponseStruct{
			StatusCode: http.StatusNotFound,
			Message:    "No entry found for the given ID",
			Data:       nil,
			Error:      "",
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	if entry.EntryDateTime==updatedEntry.EntryDateTime && entry.ExitDateTime==updatedEntry.ExitDateTime &&
	entry.EntryPrice==updatedEntry.EntryPrice && entry.ExitPrice==updatedEntry.ExitPrice &&
	entry.Description==updatedEntry.Description && entry.StockSymbol==updatedEntry.StockSymbol{
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if err := EditStockDiaryEntry(id, updatedEntry, userId); err != nil {
		data := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "Failed to update stock diary entry",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	data:=models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entry updated successfully",
		Data:       updatedEntry,
		Error:      "",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
	}


func DeleteStockDiaryEntry(id primitive.ObjectID,userId string) error {
	services.InitMongo(MongoURL)
	collection:=services.GetMongoCollection("stock", "stock_diary")
	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()
	filter:=bson.M{"_id":id,"user_id":userId}
	_,err:=collection.DeleteOne(ctx,filter)
	if err!=nil {
		log.Fatalf("Deleting the stock diary entry is unsuccessful %v",err)
		return err
	}else{
		fmt.Println("Stock diary entry deleted successfully")
		return nil
	}
}

func DeleteStockDiaryEntryHandler(w http.ResponseWriter, r *http.Request){
	userId := r.URL.Query().Get("user_id")
	id_str := strings.Split(strings.Split(r.URL.String(), "/")[2], "?")[0]
	id, err := primitive.ObjectIDFromHex(id_str)
	if err != nil {
		data := models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid ID format",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	entry, err := GetParticularStockDiaryEntry(userId, id)
	if err != nil {
		data := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "",
			Data:       nil,
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	if entry.ID == "" {
		data := models.ResponseStruct{
			StatusCode: http.StatusNotFound,
			Message:    "No entry found for the given ID",
			Data:       nil,
			Error:      "",
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	if err := DeleteStockDiaryEntry(id, userId); err != nil {
		data := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "Failed to delete stock diary entry",
			Data:       nil,	
			Error:      err.Error(),
		}
		json.NewEncoder(w).Encode(data)
		return
	}
	data:=models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Stock diary entry deleted successfully",
		Data:       nil,
		Error:      "",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}
