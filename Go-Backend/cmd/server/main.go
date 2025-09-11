package main

import (
	"fmt"
	"net/http"

	"github.com/STOCKSCREENER/Go-Backend/internal/api"
	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/robfig/cron"
)
func main() {	
	config := configs.GetConfig()
	fmt.Println("configs are ", config)
	router := http.NewServeMux()

	// every day at 8:00 AM
	c := cron.New()
	err := c.AddFunc("0 * * * *", func() {
		if err := api.RunStockScreenerService(); err != nil {
			fmt.Println("Error running stock screener service: ", err)
		}
	})
	if err != nil {
		panic(fmt.Sprintf("failed to schedule stock screener: %v", err))
	}
	c.Start()

	//stock api's
	router.HandleFunc("POST /stock/refresh-stock-data", api.RefreshCurrentStockData)



	srv := &http.Server{
		Addr:    config.Addr,
		Handler: router,
	}
	if err := srv.ListenAndServe(); err != nil {
		fmt.Println("Error starting server: ", err)
	}
}