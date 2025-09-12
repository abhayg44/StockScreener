package configs

import (
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	Addr     string
	GoStockServiceURL string
	NodeURL   string
	MongoURL  string
	AmqpURL   string
}

var(
	config *Config
	configOnce sync.Once
)

func loadConfig(){
	if err := godotenv.Load(".env"); err != nil{
		panic("Error loading .env file")
	}
	config= &Config{
		Addr:  os.Getenv("GO_ADDR"),
		GoStockServiceURL: os.Getenv("GO_STOCK_SERVICE_URL"),
		NodeURL:   os.Getenv("NODE_URL"),
		MongoURL: os.Getenv("MONGO_URL"),
		AmqpURL: os.Getenv("AMQP_URL"),
	}
}

func Getenv(key,fallback string) string {
	if value,exists:=os.LookupEnv(key); exists{
		return value
	}
	return fallback
}

func GetConfig() *Config {
	configOnce.Do(loadConfig)
	return config
}