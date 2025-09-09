package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/STOCKSCREENER/Go-Backend/internal/configs"
	"github.com/STOCKSCREENER/Go-Backend/internal/models"
)

var GoStockServiceURL = configs.GetConfig().GoStockServiceURL

func GetStocksFromPython(frequency string) (models.StockData, error) {
		client := http.Client{Timeout: 10 * time.Second}
    url := fmt.Sprintf("%s/stocks/%s", GoStockServiceURL,frequency)

    resp, err := client.Get(url)
    if err != nil {
        return models.StockData{}, err
    }
    defer resp.Body.Close()

    var stocks models.StockData
    if err := json.NewDecoder(resp.Body).Decode(&stocks); err != nil {
        return models.StockData{}, err
    }
    return stocks, nil
}