import requests
import pandas as pd
import yfinance as yf
from io import StringIO
from datetime import datetime, timedelta
import talib as ta
import numpy as np
from Screener.strategies import ma50_score_calculator, rsi_score_momentum, volume_score, final_screener

def fetch_data():
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
  company_names = df[['Company Name','Symbol']]
  yf_tickers = df['Symbol'].apply(lambda x: x + ".NS").tolist()  #append .NS to each ticker

  start_date=datetime.now() - timedelta(days=365)
  end_date=datetime.now()

  data=yf.download(yf_tickers, start=start_date, end=end_date, group_by="ticker")  #download the historical data for the tickers
  return data, yf_tickers, company_names

def company_ticker_to_name(yf_tickers,company_names):
  return {ticker: company_names[company_names['Symbol']==ticker.replace('.NS','')]['Company Name'].values[0] for ticker in yf_tickers}

def all_strategy_run():
  data, yf_tickers, company_names = fetch_data()

  #names of the companies
  company_name_dict = company_ticker_to_name(yf_tickers, company_names)

  #calling ma50 score
  bullish,bearish=[],[]
  score={}
  for ticker in yf_tickers:
    ticker_data=data[ticker]
    ma50_score=(ma50_score_calculator(ticker_data))
    if ma50_score['final_ma50_score']>0:
      bullish.append({"Ticker":ticker,"score":ma50_score['final_ma50_score'],"close":ma50_score['close'],"change":ma50_score['change'],"pct_change":ma50_score['pct_change'],"name":company_name_dict[ticker]})
    elif ma50_score['final_ma50_score']<0:
      bearish.append({"Ticker":ticker,"score":ma50_score['final_ma50_score'],"close":ma50_score['close'],"change":ma50_score['change'],"pct_change":ma50_score['pct_change'],"name":company_name_dict[ticker]})
  bullish = sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish = sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  final_data_ma50={}
  final_data_ma50={
    "bullish":bullish,
    "bearish":bearish
  }
  # print("ma50 data is ",final_data_ma50)
  print("-----------------------------------------------------")
  print("Final MA50 Data:", final_data_ma50)

  # calling rsi momentum
  bullish,bearish=[],[]
  for ticker in yf_tickers:
    ticker_data=data[ticker]
    rsi_score=(rsi_score_momentum(ticker_data))
    if(rsi_score["final_rsi_score"]>0.2):
      bullish.append({"Ticker":ticker,"score":rsi_score["final_rsi_score"],"close":rsi_score['close'],"change":rsi_score['change'],"pct_change":rsi_score['pct_change'],"name":company_name_dict[ticker]})
    elif(rsi_score["final_rsi_score"]<-0.2):
      bearish.append({"Ticker":ticker,"score":rsi_score["final_rsi_score"],"close":rsi_score['close'],"change":rsi_score['change'],"pct_change":rsi_score['pct_change'],"name":company_name_dict[ticker]})

  bullish=sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish=sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  print("-----------------------------------------------------")
  final_data_rsi={}
  final_data_rsi={
    "bullish":bullish,
    "bearish":bearish
  }
  print("Final RSI Data:", final_data_rsi)

  #calling volume indicator
  bullish,bearish=[],[]
  for ticker in yf_tickers:
    sample_data=data[ticker]
    vol_data=(volume_score(sample_data))  
    if vol_data["final_volume_score"]>0:
      bullish.append({"Ticker":ticker,"score":vol_data["final_volume_score"],"close":vol_data['close'],"change":vol_data['change'],"pct_change":vol_data['pct_change'],"name":company_name_dict[ticker]})
    else:
      bearish.append({"Ticker":ticker,"score":vol_data["final_volume_score"],"close":vol_data['close'],"change":vol_data['change'],"pct_change":vol_data['pct_change'],"name":company_name_dict[ticker]})
  bullish = sorted(bullish,key=lambda item:item["score"],reverse=True)[:7]
  bearish = sorted(bearish,key=lambda item:item["score"],reverse=True)[:7]
  print("-----------------------------------------------------")
  final_data_vol={}
  final_data_vol={
    "bullish":bullish,
    "bearish":bearish
  }
  print("Final Volume Data:", final_data_vol)

  #calling final screener
  final_data_combined=final_screener(data,yf_tickers,company_name_dict)
  print("-----------------------------------------------------")
  print("Final Combined Data:", final_data_combined)
  
  all_data={
    "ma50":final_data_ma50,
    "rsi":final_data_rsi,
    "volume":final_data_vol,
    "combined":final_data_combined,
    "last_updated":datetime.now()
  }
  return all_data

def executing_all_strategy_run():
  print("this is all strategy run -----------------------------------------")
  data=all_strategy_run()
  return data