package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func StockDataHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	ticker := r.URL.Path[len("/stock/"):]
	log.Println("Client subscribed to ticker:", ticker)

	for {
		price := fmt.Sprintf("%.2f", 100+100*float64(time.Now().Second())/60.0)
		msg := fmt.Sprintf(`{"ticker":"%s", "price":%s, "ts":"%s"}`,
			ticker, price, time.Now().Format(time.RFC3339))

		if err := conn.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
			log.Println("Write error:", err)
			break
		}
		time.Sleep(2 * time.Second) 
	}
}


