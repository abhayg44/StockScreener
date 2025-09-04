import requests
import pandas as pd
import yfinance as yf
from io import StringIO
from datetime import datetime, timedelta
from technical_analysis import moving_average
import talib as ta
import numpy as np



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

def ma50_score(data,ma_period=14,ma_short=50,ma_long=200):
  close_price=data["Close"].dropna()
  if len(close_price)<ma_long:
    return 0.0
  ma50_series=close_price.rolling(ma_short).mean().tail(ma_short)    
  ma200_series=close_price.rolling(ma_long).mean().tail(ma_long)
    
  ma50=ma50_series.iloc[-1]
  ma50_5ago=ma50_series.iloc[-5] if len(ma50_series) >= 5 else ma50_series.iloc[0]
  ma200=ma200_series.iloc[-1]
  close=close_price.iloc[-1]
    
    #Distance from MA50, shows how overall trend is 
  dist=(close-ma50)/ma50
  dist_score=max(-1,min(1,dist))
    
  # Slope of MA50, shows how strong the trend is/momentum
  slope=(ma50-ma50_5ago)/ma50
  slope_score=max(-1,min(1,slope*5))
    
    #Regime, shows a long term momentum
  regime=1 if ma50>ma200 else -1
    
    #final score based on the above 3 factors
  score=0.5*dist_score+0.3*slope_score+0.2*regime
  return round(max(-1,min(1,score)),3)

#calling ma50 score
bullish,bearish=[],[]
for ticker in yf_tickers:
  ticker_data=data[ticker]
  score=float(ma50_score(ticker_data))
  if score>0:
    bullish.append([ticker,score])
  elif score<0:
    bearish.append([ticker,score])
final_data=[]
bullish = sorted(bullish,key=lambda item:item[1],reverse=True)[:10]
bearish = sorted(bearish,key=lambda item:item[1])[:10]
print("-----------------------------------------------------")
print("Bullish Stocks (MA50 Score > 0.3):", bullish)
print("Bearish Stocks (MA50 Score < -0.3):", bearish)


def rsi_score_momentum(data,rsi_period=14,lookback=20):
  close_data=data["Close"].dropna().tail(rsi_period*4)
  rsi_series=ta.RSI(close_data,timeperiod=rsi_period)
  rsi_change=rsi_series.diff()
  cur_change=rsi_change.iloc[-1]
  stdev=rsi_change.rolling(lookback).std().iloc[-1]
  if  pd.isna(stdev) or stdev==0:
    return 0.0
  score=cur_change/(2*stdev)
  return max(-1,min(1,score))


# calling rsi momentum
bullish,bearish=[],[]
for ticker in yf_tickers:
  ticker_data=data[ticker]
  rsi_score=float(rsi_score_momentum(ticker_data))
  if(rsi_score>0.2):
    bullish.append([ticker,rsi_score])
  elif(rsi_score<-0.2):
    bearish.append([ticker,rsi_score])
    
bullish=sorted(bullish,key=lambda item:item[1],reverse=True)
bearish=sorted(bearish,key=lambda item:item[1])
print("-----------------------------------------------------")
print("bullish based on rsi are ",bullish)
print("bearish based on rsi are ",bearish)


def volume_score(data,lookback=20,slope_lookback=5):
  volume_data=data["Volume"]
  close_data=data["Close"]
  volume_series=ta.OBV(close_data,volume_data)
  if len(volume_series.dropna()) < lookback:
    return 0.0
  #current obv
  obv_recent=(volume_series[-slope_lookback:].dropna().to_numpy())
  coeffs=np.polyfit(range(len(obv_recent)),obv_recent,1)
  cur_slope=coeffs[0]
  #average obv
  obv_ma=volume_series.rolling(lookback).mean().dropna()
  obv_mean_recent=(obv_ma[-slope_lookback:].to_numpy())
  avg_coeff=np.polyfit(range(len(obv_mean_recent)),obv_mean_recent,1) #return [m,b] where m=slope and b=intercept
  avg_slope=avg_coeff[0]
  
  if avg_slope==0:
    return 0.0
  score=cur_slope/avg_slope
  return max(-1,min(1,score))

#calling volume indicator
bullish=[]
bearish=[]
for ticker in yf_tickers:
  sample_data=data[ticker]
  vol_score=float(volume_score(sample_data))  
  if vol_score>0:
    bullish.append((ticker,vol_score))
  else:
    bearish.append((ticker,vol_score))
bullish = sorted(bullish,key=lambda item:item[1],reverse=True)[:10]
bearish = sorted(bearish,key=lambda item:item[1])[:10]
print("-----------------------------------------------------")
print("bullish based on volume are ",bullish," \nbearish based on volume are ",bearish)


# def vol_score(data,lookback=20):
#   avg_vol=data["Volume"].rolling(window=lookback).mean().iloc[-1]
#   cur_vol=data["Volume"].iloc[-1]
#   ratio=cur_vol/avg_vol if avg_vol!=0 else 0
#   ratio=min(ratio,1)
#   if data['Close'].iloc[-1]>data["Close"].iloc[-2]:
#     trend_sign=1
#   elif data["Close"].iloc[-1]<data["Close"].iloc[-2]:
#     trend_sign=-1
#   else:
#     trend_sign=0
#   score_vol=ratio*trend_sign
#   return score_vol

results=[]
def final_list(data,yf_tickers):
  for ticker in yf_tickers:
    close_volume_data=data[ticker][['Close','Volume']].dropna()
    result={
      'Ticker':ticker,
      'ma50_score':float(ma50_score(close_volume_data)),
      'rsi_score':float(rsi_score_momentum(close_volume_data)),
      'vol_score':float(volume_score(close_volume_data))
    }
    
    result['final_score']=((result['ma50_score'])*0.5+(result["rsi_score"])*0.3+(result["vol_score"])*0.2)/3
    results.append(result)
    print(result)
    
final_list(data,yf_tickers)
scanner_df=pd.DataFrame(results)
print("final result -----------------------------")
bearish_list=scanner_df.sort_values(by="final_score").head(10)
bearish_final_list=bearish_list["Ticker"]
print("bearish final list is ",bearish_final_list)
bullish_list=scanner_df.sort_values(by="final_score",ascending=False).head(10)
bullish_final_list=bullish_list["Ticker"]
print("bullish final list is ",bullish_final_list)
