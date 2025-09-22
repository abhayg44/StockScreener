from datetime import datetime
import yfinance as yf

def get_historic_data(ticker: str, period: str="90d", interval: str = "1d"):
    ticker_obj = yf.Ticker(ticker)  
    hist = ticker_obj.history(period=period, interval=interval)

    historic_data = [
        {
            "date": index.date().isoformat(),
            "price": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
            "dividends": round(float(row["Dividends"]), 2),
        }
        for index, row in hist.iterrows()
    ]

    return {
        "ticker": ticker,
        "historic_data": historic_data,
        "52w_high": ticker_obj.info.get("fiftyTwoWeekHigh"),
        "52w_low": ticker_obj.info.get("fiftyTwoWeekLow"),
        "market_cap": ticker_obj.info.get("marketCap"),
        "pe_ratio": ticker_obj.info.get("trailingPE"),
        "dividend_yield": ticker_obj.info.get("dividendYield"),
        "market": ticker_obj.info.get("market"),
        "sector": ticker_obj.info.get("sector"),
        "industry": ticker_obj.info.get("industry"),
        "website": ticker_obj.info.get("website"),
        "long_name": ticker_obj.info.get("longName"),
        }