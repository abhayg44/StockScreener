from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from DataHandler.historicDataProducer import get_historic_data
import os
from dotenv import load_dotenv
import logging
import traceback

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stock/{ticker}")
async def stock_data_handler(request: Request, ticker: str, period: str = "90d", interval: str = "1d"):
    logging.info("Incoming request Origin: %s", request.headers.get("origin"))
    try:
        logging.info("Request for %s period=%s interval=%s", ticker, period, interval)
        res = get_historic_data(ticker, period, interval)
        if not isinstance(res, dict):
            logging.error("historicDataProducer returned non-dict: %s", type(res))
            return JSONResponse(status_code=500, content={"error": "internal error - bad data"})
        return JSONResponse(status_code=200, content=res)
    except Exception as e:
        logging.exception("Unhandled exception in stock_data_handler: %s", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "internal_server_error", "message": str(e)})