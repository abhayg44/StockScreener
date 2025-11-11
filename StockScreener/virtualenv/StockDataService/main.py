from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from DataHandler.historicDataProducer import get_historic_data
import logging
import traceback

logging.basicConfig(level=logging.INFO)

app = FastAPI()

origins=[
    "http://localhost:3000",
    "https://frontend-image-yb47.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'Your API is running',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.get("/stock/{ticker}")
async def stock_data_handler(request: Request, ticker: str, period: str = "90d", interval: str = "1d"):
    logging.info("Incoming request Origin: %s", request.headers.get("origin"))

    try:
        res = get_historic_data(ticker, period, interval)
        if not isinstance(res, dict):
            logging.error("historicDataProducer returned non-dict: %s", type(res))
            return JSONResponse(status_code=500, content={"error": "internal_error", "message": "Unexpected data format"})

        # Handle rate limit gracefully
        if res.get("error") == "rate_limited":
            return JSONResponse(status_code=429, content=res)

        # Handle normal error responses
        if res.get("error"):
            return JSONResponse(status_code=400, content=res)

        return JSONResponse(status_code=200, content=res)

    except Exception as e:
        logging.exception("Unhandled exception in stock_data_handler: %s", e)
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "message": str(e)}
        )
        
@app.get("/stockdiary/{ticker}")
async def stock_diary_handler(
    request: Request, 
    ticker: str, 
    entry: str = Query(..., description="Entry datetime (ISO-8601 or parseable by pandas.to_datetime)"),
    exit: str = Query(..., description="Exit datetime (ISO-8601 or parseable by pandas.to_datetime)")
):
    logging.info("Incoming request Origin: %s", request.headers.get("origin"))
    try:
        res = get_historic_data(ticker, entry, exit)

        if not isinstance(res, dict):
            logger.error("diary data returned non-dict: %s", type(res))
            return JSONResponse(status_code=500, content={"error": "internal_error", "message": "Unexpected data format"})

        if res.get("error") == "rate_limited":
            return JSONResponse(status_code=429, content=res)

        if res.get("error"):
            return JSONResponse(status_code=400, content=res)

        return JSONResponse(status_code=200, content=res)

    except Exception as e:
        logger.exception("Unhandled exception in stock_diary_handler: %s", e)
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "message": str(e)}
        )