from datetime import datetime
import yfinance as yf
import numpy as np
import time
import logging
import pandas as pd

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

import pandas as pd
import yfinance as yf
import logging
import time

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

def get_historic_data(ticker: str, entry_time: str, exit_time: str):
    try:
        entry_dt = pd.to_datetime(entry_time, dayfirst=True).tz_localize("Asia/Kolkata")
        exit_dt = pd.to_datetime(exit_time, dayfirst=True).tz_localize("Asia/Kolkata")
        if exit_dt <= entry_dt:
            exit_dt += pd.Timedelta(days=1)

        start_dt = entry_dt - pd.Timedelta(minutes=5)
        end_dt = exit_dt + pd.Timedelta(minutes=5)
        total_hours = (end_dt - start_dt).total_seconds() / 3600

        # Interval
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

        # individual data
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
