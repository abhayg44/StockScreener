from datetime import datetime
import yfinance as yf
import numpy as np
import time
import logging

def safe_val(v):
    if isinstance(v, float) and np.isnan(v):
        return None
    return v

def get_latest_n(df, key, n=3):
    if key not in df.index:
        return []
    vals = df.loc[key].dropna().tail(n)
    return [
        {
            "date": str(idx.date()) if hasattr(idx, "date") else str(idx),
            "value": safe_val(val)
        }
        for idx, val in zip(vals.index, vals.values)
    ]

def get_historic_data(ticker: str, period: str="90d", interval: str="1d"):
    def safe_call(func, *args, retries=3, **kwargs):
        """Retry wrapper for yfinance calls."""
        for attempt in range(retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if "Too Many Requests" in str(e):
                    logging.warning(f"Rate limited by Yahoo API. Retrying in 2s... (attempt {attempt+1}/{retries})")
                    time.sleep(2)
                else:
                    raise e
        raise Exception("Too Many Requests after retries")

    try:
        ticker_obj = yf.Ticker(ticker)

        hist = safe_call(ticker_obj.history, period=period, interval=interval)
        if hist.empty:
            return {"error": "no_data", "message": f"No data for {ticker}"}

        historic_data = [
            {
                "date": index.date().isoformat(),
                "price": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
                "dividends": round(float(row["Dividends"]), 2),
            }
            for index, row in hist.iterrows()
        ]

        # Yesterday’s data
        yst_data = safe_call(ticker_obj.history, period="2d", interval="1d")
        if len(yst_data) > 1:
            yesterday = yst_data.iloc[-2]
        else:
            yesterday = yst_data.iloc[-1]
        yesterday_data = {
            "date": str(yesterday.name.date().isoformat()),
            "close": round(float(yesterday["Close"]), 2),
            "high": round(float(yesterday["High"]), 2),
            "low": round(float(yesterday["Low"]), 2),
            "open": round(float(yesterday["Open"]), 2),
            "volume": int(yesterday["Volume"]),
        }

        # Financials 
        fin_df = safe_call(lambda: ticker_obj.financials)
        bs_df = safe_call(lambda: ticker_obj.balance_sheet)
        cf_df = safe_call(lambda: ticker_obj.cashflow)

        growth_data = {
            "net_income": get_latest_n(fin_df, "Net Income"),
            "ebitda": get_latest_n(fin_df, "EBITDA"),
            "operating_income": get_latest_n(fin_df, "Operating Income"),
            "total_assets": get_latest_n(bs_df, "Total Assets"),
            "total_liabilities": get_latest_n(bs_df, "Total Liabilities Net Minority Interest"),
            "networth": get_latest_n(bs_df, "Total Equity Gross Minority Interest"),
            "free_cash_flow": get_latest_n(cf_df, "Free Cash Flow"),
        }

        info = safe_call(lambda: ticker_obj.info)
        if not info or not isinstance(info,dict):
            logging.warning("No data available")
            info={}

        return {
            "name": info.get("longName") or info.get("shortName") or ticker,
            "ticker": ticker,
            "historic_data": historic_data,
            "yesterday_data": yesterday_data,
            "growth_data": growth_data,
            "52w_high": info.get("fiftyTwoWeekHigh"),
            "52w_low": info.get("fiftyTwoWeekLow"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "pb_ratio": info.get("priceToBook"),
            "dividend_yield": info.get("dividendYield"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "website": info.get("website"),
        }

    except Exception as e:
        logging.error(f"Error in get_historic_data: {e}")
        return {"error": "internal_error", "message": str(e)}
