package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/models"
	"github.com/STOCKSCREENER/Go-Backend/internal/services"
	"go.mongodb.org/mongo-driver/bson"
)

// Fetch wishlist data from Mongo
func GetWishlistDataJob(userId string) ([]models.WishlistData, error) {
	services.InitMongo(MongoURL)
	collection := services.GetMongoCollection("stock", "wishlist")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"user_id": userId})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var wishlists []models.WishlistData
	if err = cursor.All(ctx, &wishlists); err != nil {
		return nil, err
	}

	return wishlists, nil
}

// Store wishlist data in Mongo
func StoreWishlistDataJob(wishlist models.WishlistData,userId string) (success string,err error) {
	services.InitMongo(MongoURL)
	if wishlist.Ticker == "" || wishlist.Name == "" || wishlist.ClosePrice == 0 {
		return "", fmt.Errorf("Invalid wishlist data")
	}
	collection := services.GetMongoCollection("stock", "wishlist")
	fmt.Println("wishlist data is", wishlist)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingWishlist models.WishlistData
	err = collection.FindOne(ctx, bson.M{"user_id": userId, "ticker": wishlist.Ticker}).Decode(&existingWishlist)
	if err != nil {
		//check if the error is due to no documents found
		if err.Error() == "mongo: no documents in result" {
            fmt.Println("No existing wishlist item found, proceeding to insert.")
            fmt.Println("Inserting new wishlist item:", wishlist)
            _, insertErr := collection.InsertOne(ctx, wishlist)
            if insertErr != nil {
                return "", insertErr
            }
            return "done", nil
        }
        // Some other error 
        return "", err
}

fmt.Println("Existing wishlist item:", existingWishlist)
    return "exists", nil
}


//Delte wishlist data in Mongo
func DeleteWishlistDataJob(userId string,ticker string) (error) {
	services.InitMongo(MongoURL)
	collection := services.GetMongoCollection("stock", "wishlist")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := collection.DeleteOne(ctx, bson.M{"user_id": userId,"ticker":ticker})
	if err != nil {
		return fmt.Errorf("Failed to delete wishlist item: %w", err)
	}
	return nil
}

func DeleteWishlistData(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")

	if userId == "" {
		http.Error(w, "Invalid user_id", http.StatusBadRequest)
		return
	}
	ticker := r.URL.Query().Get("ticker")
	if ticker == "" {
		http.Error(w, "Ticker is required", http.StatusBadRequest)
		return
	}
	fmt.Println("Deleting wishlist item for user_id:", userId, "ticker:", ticker)

	if err := DeleteWishlistDataJob(userId,ticker); err != nil {
		http.Error(w, "Failed to delete wishlist item", http.StatusInternalServerError)
		return
	}
	response := models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Wishlist item deleted successfully",
		Error:     "",
		Data:      nil,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func GetIsWishlistData(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	if userId == "" {
		response:=models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid user_id",
			Error: 	 "Invalid user_id",
			Data: nil,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
		return
	}

	ticker := r.URL.Query().Get("ticker")
	if ticker == "" {
		response:=models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Ticker is required",
			Error: 	 "Ticker is required",
			Data: 		nil,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	return
	}
	services.InitMongo(MongoURL)
	collection := services.GetMongoCollection("stock", "wishlist")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var existingWishlist models.WishlistData

	// Check if the wishlist item already exists
	err := collection.FindOne(ctx, bson.M{"user_id": userId, "ticker": ticker}).Decode(&existingWishlist)
	if err != nil {
		//check if the error is due to no documents found
		if err.Error() == "mongo: no documents in result" {
            // Item not wishlisted
            w.WriteHeader(http.StatusOK)
            response := models.ResponseStruct{
                StatusCode: http.StatusOK,
                Message:    "Item not in wishlist",
                Error:      "",
                Data:       map[string]bool{"is_wishlisted": false},
            }
            json.NewEncoder(w).Encode(response)
        }  else {
            // Database error
            w.WriteHeader(http.StatusInternalServerError)
            response := models.ResponseStruct{
                StatusCode: http.StatusInternalServerError,
                Message:    "Error checking wishlist status",
                Error:      err.Error(),
                Data:       nil,
            }
            json.NewEncoder(w).Encode(response)
        }
	}else{
		fmt.Println("Existing wishlist item found:", existingWishlist)
		response := models.ResponseStruct{
			StatusCode: http.StatusOK,
			Message:    "Wishlist item exists",
			Error:     "",
			Data:   map[string]bool{"is_wishlisted": true},
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	}
}

// GET wishlist handler
func GetWishlistData(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	if userId == "" {
		response := models.ResponseStruct{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid user_id",
			Error:     "Invalid user_id",
			Data:      nil,
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
		return
	}

	fmt.Println("Fetching wishlist data for user_id:", userId)

	wishlists, err := GetWishlistDataJob(userId)
	if err != nil {
		response := models.ResponseStruct{
			StatusCode: http.StatusInternalServerError,
			Message:    "Failed to fetch wishlist data",
			Error:     err.Error(),
		}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
		return
	}

	fmt.Println("Wishlist data fetched:", wishlists)
	response := models.ResponseStruct{
		StatusCode: http.StatusOK,
		Message:    "Wishlist data fetched successfully",
		Data:      wishlists,
		Error: "",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode wishlist data", http.StatusInternalServerError)
		return
	}
}

// POST wishlist handler
func StoreWishlistData(w http.ResponseWriter, r *http.Request) {
    var wishlist models.WishlistData
    userId := r.URL.Query().Get("user_id")
    if userId == "" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        response := models.ResponseStruct{
            StatusCode: http.StatusBadRequest,
            Message:    "Invalid user_id",
            Error:      "user_id is required",
            Data:       nil,
        }
        json.NewEncoder(w).Encode(response)
        return
    }

    if err := json.NewDecoder(r.Body).Decode(&wishlist); err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        response := models.ResponseStruct{
            StatusCode: http.StatusBadRequest,
            Message:    "Invalid request payload",
            Error:      err.Error(),
            Data:       nil,
        }
        json.NewEncoder(w).Encode(response)
        return
    }
    wishlist.UserID = userId
    wishlist.CreatedAt = time.Now()
		fmt.Println("Received wishlist data:", wishlist)
		w.Header().Set("Content-Type", "application/json")

    message, err := StoreWishlistDataJob(wishlist, userId)
    if err != nil {
        fmt.Println("Error storing wishlist:", err)
        w.WriteHeader(http.StatusInternalServerError)
        response := models.ResponseStruct{
            StatusCode: http.StatusInternalServerError,
            Message:    "Failed to store wishlist",
            Error:      err.Error(),
            Data:       nil,
        }
        json.NewEncoder(w).Encode(response)
        return
    }

    if message == "exists" {
        w.WriteHeader(http.StatusConflict)
        response := models.ResponseStruct{
            StatusCode: http.StatusConflict,
            Message:    message,
            Error:      "",
            Data:       nil,
        }
        json.NewEncoder(w).Encode(response)
    } else {
        w.WriteHeader(http.StatusCreated)
        response := models.ResponseStruct{
            StatusCode: http.StatusCreated,
            Message:    "Wishlist item added successfully",
            Error:      "",
            Data:       wishlist,
        }
        json.NewEncoder(w).Encode(response)
    }
}
	
// func UpdateWishlistDataJob(userId int) (*mongo.UpdateResult, error) {
// 	services.InitMongo(MongoURL)
// 	collection:= services.GetMongoCollection("stock", "wishlist")
// 	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
// 	defer cancel()
// 	cursor,err:=collection.Find(ctx,bson.M{"user_id":userId})
// 	if err!=nil{
// 		return nil, err
// 	}
// 	defer cursor.Close(ctx)
// 	var wishlists []models.WishlistData
// 	if err = cursor.All(ctx,&wishlists); err!=nil{
// 		return nil, err
// 	}
// }
