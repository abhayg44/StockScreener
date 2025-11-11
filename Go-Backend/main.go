package main

import (
	"fmt"
	"net/http"

	"github.com/STOCKSCREENER/Go-Backend/internal/api"
	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/robfig/cron"
	"github.com/rs/cors"
)
func main() {
	c := cors.New(cors.Options{
    AllowedOrigins:   []string{"http://localhost:5000","https://backend-image-jwy6.onrender.com"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Content-Type", "Authorization"},
    AllowCredentials: true,
})

	config := configs.GetConfig()
	fmt.Println("configs are ", config)
	router := http.NewServeMux()

	handler := c.Handler(router)

	// every hour cron expression
	cr := cron.New()
	err := cr.AddFunc("0 0 * * *", func() {
		_, err := api.RefreshCurrentStockDataJob()
		if err != nil {
			fmt.Println("Error running stock screener service: ", err)
		}
	})
	if err != nil {
		panic(fmt.Sprintf("failed to schedule stock screener: %v", err))
	}
	cr.Start()

	//stock api's
	router.HandleFunc("POST /stock/refresh-stock-data", api.RefreshCurrentStockData)

	router.HandleFunc("/stock/", api.StockDataHandler)
	
	router.HandleFunc("POST /stock/wishlist", api.StoreWishlistData)

	router.HandleFunc("GET /stock/wishlist", api.GetWishlistData)

	router.HandleFunc("GET /stock/iswishlist", api.GetIsWishlistData)

	router.HandleFunc("DELETE /stock/wishlist", api.DeleteWishlistData)

	// router.HandleFunc("GET /stockdiary", api.GetStockDiaryEntryHandler)

	router.HandleFunc("GET /stockdiary", api.GetStockDiaryPaginationHandler)

	router.HandleFunc("POST /stockdiary", api.StoreStockDiaryEntryHandler)

	router.HandleFunc("GET /stockdiary/{id}",api.GetParticularStockDiaryEntryHandler)

	router.HandleFunc("PUT /stockdiary/{id}", api.EditStockDiaryEntryHandler)

	router.HandleFunc("DELETE /stockdiary/{id}", api.DeleteStockDiaryEntryHandler)

	srv := &http.Server{
		Addr:    config.Addr,
		Handler: handler,
	}
	if err := srv.ListenAndServe(); err != nil {
		fmt.Println("Error starting server: ", err)
	}
}