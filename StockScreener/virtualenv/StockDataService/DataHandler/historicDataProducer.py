from datetime import datetime
import yfinance as yf
import numpy as np
import time
import logging
import pandas as pd

#In memory cache for historic data
CACHE_TTL_SECONDS = 120
_historic_cache = {}


def _get_cache(key):
    entry = _historic_cache.get(key)
    if not entry:
        return None
    if time.time() - entry["ts"] > CACHE_TTL_SECONDS:
        _historic_cache.pop(key, None)
        return None
    return entry["data"]


def _set_cache(key, value):
    _historic_cache[key] = {"ts": time.time(), "data": value}

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


def safe_call(func, *args, retries=3, **kwargs):
    for attempt in range(retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if "Too Many Requests" in str(e):
                time.sleep(2)
            else:
                raise e
    raise Exception("Too Many Requests after retries")

def get_stock_diary_data(ticker: str, entry_time: str, exit_time: str):
    try:
        entry_dt = pd.to_datetime(entry_time, dayfirst=True).tz_localize("Asia/Kolkata")
        exit_dt = pd.to_datetime(exit_time, dayfirst=True).tz_localize("Asia/Kolkata")
        if exit_dt <= entry_dt:
            exit_dt += pd.Timedelta(days=1)

        start_dt = entry_dt - pd.Timedelta(minutes=5)
        end_dt = exit_dt + pd.Timedelta(minutes=5)
        total_hours = (end_dt - start_dt).total_seconds() / 3600

        if total_hours <= 12:
            interval = "5m"
        elif total_hours <= 48:
            interval = "15m"
        elif total_hours <= 24 * 7:
            interval = "30m"
        else:
            interval = "60m"

        logging.info(f"Fetching {ticker} day-by-day from {start_dt} to {end_dt}, interval={interval}")
        ticker_obj = yf.Ticker(ticker)

        all_parts = []
        day_cursor = start_dt.normalize()
        while day_cursor <= end_dt.normalize():
            day_start = day_cursor
            day_end = day_cursor + pd.Timedelta(days=1)

            hist_part = safe_call(
                ticker_obj.history,
                start=day_start,
                end=day_end,
                interval=interval,
            )

            if hist_part is not None and not hist_part.empty:
                hist_part.index = hist_part.index.tz_convert("Asia/Kolkata").tz_localize(None)
                all_parts.append(hist_part)

            day_cursor += pd.Timedelta(days=1)

        if not all_parts:
            return {"error": "no_data", "message": f"No intraday data found for {ticker}"}

        hist = pd.concat(all_parts).sort_index()

        start_naive = start_dt.tz_convert("Asia/Kolkata").tz_localize(None)
        end_naive = end_dt.tz_convert("Asia/Kolkata").tz_localize(None)
        hist = hist.loc[(hist.index >= start_naive) & (hist.index <= end_naive)]

        if hist.empty:
            return {"error": "no_data", "message": "No records in requested range"}

        intraday_data = [
            {
                "datetime": idx.isoformat(),
                "label": idx.strftime("%d/%m/%Y %H:%M"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]

        return {
            "ticker": ticker,
            "data": intraday_data,
            "start_time": start_dt.isoformat(),
            "end_time": end_dt.isoformat(),
            "interval_used": interval,
        }

    except Exception as e:
        logging.exception("Error in get_diary_data")
        return {"error": "internal_error", "message": str(e)}
    
def get_historic_data(ticker: str, period: str="90d", interval: str="1d"):
    def safe_call(func, *args, retries=6, **kwargs):
        base_delay = 1.5
        for attempt in range(retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if "Too Many Requests" in str(e):
                    delay = base_delay * (attempt + 1)
                    logging.warning(
                        f"Rate limited by Yahoo API. Backing off for {delay:.1f}s (attempt {attempt+1}/{retries})"
                    )
                    time.sleep(delay)
                else:
                    raise e
        raise Exception("Too Many Requests after retries")

    try:
        cache_key = (ticker, period, interval)
        cached = _get_cache(cache_key)

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

        result = {
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

        _set_cache(cache_key, result)
        return result

    except Exception as e:
        if "Too Many Requests" in str(e):
            cached = _get_cache((ticker, period, interval))
            if cached:
                logging.warning("Rate limited upstream; serving cached historical data for %s", ticker)
                cached = dict(cached)
                cached["warning"] = "rate_limited_upstream_served_cache"
                return cached
        logging.error(f"Error in get_historic_data: {e}")
        return {"error": "internal_error", "message": str(e)}
