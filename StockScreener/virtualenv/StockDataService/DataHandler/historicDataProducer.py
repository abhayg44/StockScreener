from datetime import datetime
import yfinance as yf
import numpy as np

def safe_val(v):
    if isinstance(v, float) and np.isnan(v):
        return None
    return v

def get_latest_n(df, key, n=3):
    # df: pandas DataFrame, key: column name, n: number of periods
    if key not in df.index:
        return []
    vals = df.loc[key].dropna().tail(n)
    # Use index as date, value as value
    return [
        {
            "date": str(idx.date()) if hasattr(idx, "date") else str(idx),
            "value": safe_val(val)
        }
        for idx, val in zip(vals.index, vals.values)
    ]

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
    
    # yesterday data
    yst_data = ticker_obj.history(period="2d", interval="1d")
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
    
    # financials
    fin_df = ticker_obj.financials
    bs_df = ticker_obj.balance_sheet
    cf_df = ticker_obj.cashflow

    # Get latest 3 values for each metric
    net_income = get_latest_n(fin_df, "Net Income")
    ebitda = get_latest_n(fin_df, "EBITDA")
    operating_income = get_latest_n(fin_df, "Operating Income")

    total_assets = get_latest_n(bs_df, "Total Assets")
    total_liabilities = get_latest_n(bs_df, "Total Liabilities Net Minority Interest")
    networth = get_latest_n(bs_df, "Total Equity Gross Minority Interest")

    free_cash_flow = get_latest_n(cf_df, "Free Cash Flow")


    # For balance_sheet, you can use total_assets or networth as needed

    growth_data = {
        "net_income": net_income,
        "ebitda": ebitda,
        "operating_income": operating_income,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "networth": networth,
        "free_cash_flow": free_cash_flow,
    }

    return {
        "ticker": ticker,
        "historic_data": historic_data,
        "yesterday_data": yesterday_data,
        "growth_data": growth_data,
        "52w_high": ticker_obj.info.get("fiftyTwoWeekHigh"),
        "52w_low": ticker_obj.info.get("fiftyTwoWeekLow"),
        "market_cap": ticker_obj.info.get("marketCap"),
        "pe_ratio": ticker_obj.info.get("trailingPE"),
        "pb_ratio": ticker_obj.info.get("priceToBook"),
        "dividend_yield": ticker_obj.info.get("dividendYield"),
        "sector": ticker_obj.info.get("sector"),
        "industry": ticker_obj.info.get("industry"),
        "website": ticker_obj.info.get("website"),
    }
