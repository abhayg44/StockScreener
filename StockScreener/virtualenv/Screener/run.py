import requests
import pandas as pd
import yfinance as yf
from io import StringIO
from datetime import datetime, timedelta
import talib as ta
import numpy as np
from Screener.strategies import ma50_score, rsi_score_momentum, volume_score, final_screener

def complete_run():
  print("this is complete run -----------------------------------------")
  url = "https://nsearchives.nseindia.com/content/indices/ind_nifty50list.csv"

  headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Connection": "keep-alive"
  }

  resp = requests.get(url, headers=headers, timeout=20)  #get the data from the URL
  resp.raise_for_status()

  df = pd.read_csv(StringIO(resp.text))  #convert the string values to CSV 
  yf_tickers = df['Symbol'].apply(lambda x: x + ".NS").tolist()  #append .NS to each ticker

  start_date=datetime.now() - timedelta(days=365)
  end_date=datetime.now()

  data=yf.download(yf_tickers, start=start_date, end=end_date, group_by="ticker")  #download the historical data for the tickers

  #calling ma50 score
  bullish,bearish=[],[]
  for ticker in yf_tickers:
    ticker_data=data[ticker]
    score=float(ma50_score(ticker_data))
    if score>0:
      bullish.append({"Ticker":ticker,"score":score})
    elif score<0:
      bearish.append({"Ticker":ticker,"score":score})
  bullish = sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish = sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  final_data_ma50={}
  final_data_ma50={
    "bullish":bullish,
    "bearish":bearish
  }
  # print("-----------------------------------------------------")
  # print("Final MA50 Data:", final_data_ma50)

  # calling rsi momentum
  bullish,bearish=[],[]
  for ticker in yf_tickers:
    ticker_data=data[ticker]
    rsi_score=float(rsi_score_momentum(ticker_data))
    if(rsi_score>0.2):
      bullish.append({"Ticker":ticker,"score":rsi_score})
    elif(rsi_score<-0.2):
      bearish.append({"Ticker":ticker,"score":rsi_score})

  bullish=sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish=sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  # print("-----------------------------------------------------")
  final_data_rsi={}
  final_data_rsi={
    "bullish":bullish,
    "bearish":bearish
  }
  # print("Final RSI Data:", final_data_rsi)

  #calling volume indicator
  bullish,bearish=[],[]
  for ticker in yf_tickers:
    sample_data=data[ticker]
    vol_score=float(volume_score(sample_data))  
    if vol_score>0:
      bullish.append({"Ticker":ticker,"score":vol_score})
    else:
      bearish.append({"Ticker":ticker,"score":vol_score})
  bullish = sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish = sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  # print("-----------------------------------------------------")
  final_data_vol={}
  final_data_vol={
    "bullish":bullish,
    "bearish":bearish
  }
  # print("Final Volume Data:", final_data_vol)

  #calling final screener
  final_data_combined=final_screener(data,yf_tickers)
  # print("-----------------------------------------------------")
  # print("Final Combined Data:", final_data_combined)
  
  all_data={
    "ma50":final_data_ma50,
    "rsi":final_data_rsi,
    "volume":final_data_vol,
    "combined":final_data_combined
  }  
  return all_data

def executing_complete_run():
  print("this is complete run -----------------------------------------")
  data=complete_run()
  return data