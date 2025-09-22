from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from StockDataService.DataHandler.historicDataProducer import get_historic_data
import asyncio
import os
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

origins=[
  os.getenv("REACT_URL"),
  "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/stock/{ticker}")
async def stock_data_handler(ticker: str, period: str="90d", interval: str = "1d"):
  print("data from main api",ticker,period,interval)
  res = get_historic_data(ticker, period, interval)
  return JSONResponse(content=res)


    