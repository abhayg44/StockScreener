import React from "react";
import "./StockList.css";
import axios from "axios";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function StockList() {
  const location = useLocation();
  const [ma50_data, setma50_data] = React.useState([]);
  const [rsi_data, setrsi_data] = React.useState([]);
  const [volume_data, setvolume_data] = React.useState([]);
  const [combined_data, setcombined_data] = React.useState([]);
  const [unauthorized, setUnauthorized] = React.useState(
    localStorage.getItem("token") ? false : true
  );

  const token = localStorage.getItem("token");
  console.log("token is available ", token);
  const nodeStockURL = process.env.REACT_APP_NODE_STOCK_SERVICE_URL;
  console.log("url for stock service is ", nodeStockURL);
  const getStockData = async (token) => {
    try {
      const res = await axios.get(nodeStockURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("total data is ", JSON.stringify(res.data[0].data));
      setma50_data([
        ...res.data[0].data["ma50"]["bullish"],
        ...res.data[0].data["ma50"]["bearish"],
      ]);
      console.log("data is ", ma50_data);
      setrsi_data([
        ...res.data[0].data["rsi"]["bullish"],
        ...res.data[0].data["rsi"]["bearish"],
      ]);
      setvolume_data([
        ...res.data[0].data["volume"]["bullish"],
        ...res.data[0].data["volume"]["bearish"],
      ]);
      setcombined_data([
        ...res.data[0].data["combined"]["bullish"],
        ...res.data[0].data["combined"]["bearish"],
      ]);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUnauthorized(true);
        localStorage.removeItem("token");
        setUnauthorized(true);
      }
    }
  };

  useEffect(() => {
    if (token) {
      setUnauthorized(false);
      getStockData(token);
    } else {
      setUnauthorized(true);
    }
  }, [token]);

  console.log("unauthorized is ", unauthorized);
  if (unauthorized) {
    return (
      <div className="unauthorized-overlay">
        <div className="unauthorized-box">
          <h2>Unauthorized Access</h2>
          <p>Please login to continue</p>
          <Link to="/register" className="login-btn">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-main-container">
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Momentum-Indicator</h1>
        {ma50_data.map((stock, idx) => {
          return (
            <div className="stock-tile" key={idx}>
              <h3>{stock["name"]}</h3>
              <p>ma50-ma200 based score: {stock["score"]}</p>
              <p>Close: ${stock["close"]}</p>
            </div>
          );
        })}
      </div>
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Price-Breakout</h1>
        {rsi_data.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock["name"]}</h3>
            <p>rsi based score: {stock["score"]}</p>
            <p>Close: ${stock["close"]}</p>
          </div>
        ))}
      </div>
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Volume-Based</h1>
        {volume_data.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock["name"]}</h3>
            <p>Volume based score: {stock["score"]}</p>
            <p>Close: ${stock["close"]}</p>
          </div>
        ))}
      </div>
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Final Data</h1>
        {combined_data.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock["name"]}</h3>
            <p>Combined score: {stock["score"]}</p>
            <p>Close: ${stock["close"]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockList;
