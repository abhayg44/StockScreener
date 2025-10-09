import pandas as pd
import talib as ta
import numpy as np

def ma50_score_calculator(data,ma_period=14,ma_short=50,ma_long=200):
  close_data=data["Close"].dropna()
  if len(close_data)<ma_long:
    return {
      "final_ma50_score": 0.0,
      "close": float(close_data.iloc[-1]) if len(close_data) > 0 else None,
    }
  ma50_series=close_data.rolling(ma_short).mean().tail(ma_short)    
  ma200_series=close_data.rolling(ma_long).mean().tail(ma_long)
    
  ma50=ma50_series.iloc[-1]
  ma50_5ago=ma50_series.iloc[-5] if len(ma50_series) >= 5 else ma50_series.iloc[0]
  ma200=ma200_series.iloc[-1]
  close=close_data.iloc[-1]
    
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
  final_ma_50_score=float(round(max(-1,min(1,score)),3))
  final_ma50_data={
    "final_ma50_score":final_ma_50_score,
    "close":round(float(close_data.iloc[-1]),2),
    "change":round(float(close_data.iloc[-1]-close_data.iloc[-2]),2) if len(close_data) > 1 else None,
    "pct_change":round(float((close_data.iloc[-1]-close_data.iloc[-2])/close_data.iloc[-2]*100),2) if len(close_data) > 1 else None,
  }
  return final_ma50_data


def rsi_score_momentum(data,rsi_period=14,lookback=20):
  close_data=data["Close"].dropna().tail(rsi_period*4)
  rsi_series=ta.RSI(close_data,timeperiod=rsi_period)
  rsi_change=rsi_series.diff()
  cur_change=rsi_change.iloc[-1]
  stdev=rsi_change.rolling(lookback).std().iloc[-1]
  if  pd.isna(stdev) or stdev==0:
    return 0.0
  score=cur_change/(2*stdev)
  final_rsi_score=float(round(max(-1,min(1,score)),3))
  final_rsi_data={
    "final_rsi_score":final_rsi_score,
    "close":round(float(close_data.iloc[-1]),2),
    "change":round(float(close_data.iloc[-1]-close_data.iloc[-2]),2) if len(close_data) > 1 else None,
    "pct_change":round(float((close_data.iloc[-1]-close_data.iloc[-2])/close_data.iloc[-2]*100),2) if len(close_data) > 1 else None
  }
  return final_rsi_data


def volume_score(data,lookback=20,slope_lookback=5):
  volume_data=data["Volume"].dropna()
  close_data=data["Close"].dropna()
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
  final_volume_score=float(round(max(-1,min(1,score)),3))
  final_volume_data={
    "final_volume_score":final_volume_score,
    "close":round(float(close_data.iloc[-1]),2),
    "change":round(float(close_data.iloc[-1]-close_data.iloc[-2]),2) if len(close_data) > 1 else None,
    "pct_change":round(float((close_data.iloc[-1]-close_data.iloc[-2])/close_data.iloc[-2]*100),2) if len(close_data) > 1 else None
  }
  return final_volume_data


def final_screener(data,yf_tickers,company_name_dict):
  results=[]
  for ticker in yf_tickers:
    close_volume_data=data[ticker][['Close','Volume']].dropna()
    result={
      'Ticker':ticker,
      'ma50_score':(ma50_score_calculator(close_volume_data))["final_ma50_score"],
      'rsi_score':(rsi_score_momentum(close_volume_data))["final_rsi_score"],
      'vol_score':(volume_score(close_volume_data))["final_volume_score"],
    }

    result['score']=float(round(((result['ma50_score'])*0.5+(result["rsi_score"])*0.3+(result["vol_score"])*0.2)/3, 3))
    result['close']=round(float(close_volume_data["Close"].iloc[-1]),2)
    result['name']=company_name_dict[ticker]
    result["change"]=round(float(close_volume_data["Close"].iloc[-1]-close_volume_data["Close"].iloc[-2]),2) if len(close_volume_data) > 1 else None
    result["pct_change"]=round(float((close_volume_data["Close"].iloc[-1]-close_volume_data["Close"].iloc[-2])/close_volume_data["Close"].iloc[-2]*100),2) if len(close_volume_data) > 1 else None
    results.append(result)
    
  scanner_df=pd.DataFrame(results)
  scanner_df=scanner_df.sort_values(by="score",ascending=False)
  bullish=scanner_df[["Ticker","score","close","name","change","pct_change"]].head(10).to_dict(orient="records")
  bearish=scanner_df[["Ticker","score","close","name","change","pct_change"]].tail(10).to_dict(orient="records")
  return {
    "bullish":bullish,
    "bearish":bearish
  }