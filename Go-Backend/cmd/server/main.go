package main

import (
	"fmt"
	"net/http"

	"github.com/STOCKSCREENER/Go-Backend/internal/api"
	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
)
func main() {	
	config := configs.GetConfig()
	fmt.Println("configs are ", config)
	router := http.NewServeMux()
	// c := cron.New()
	// // every day at 8:00 AM
	// _, err := c.AddFunc("0 8 * * *", api.RunStockScreenerService)
	// if err != nil {
	// 	log.Fatal("failed to schedule stock screener:", err)
	// }
	// c.Start()
	fmt.Println("sending data to rabbitmq")
	api.RunStockScreenerService()

	router.HandleFunc("/stocks/?Frequency=", api.GetStockHandler)
	router.HandleFunc("/stocks", api.PostStockHandler)
	srv := &http.Server{
		Addr:    config.Addr,
		Handler: router,
	}
	if err := srv.ListenAndServe(); err != nil {
		fmt.Println("Error starting server: ", err)
	}
}