import React from "react";
import "./StockList.css";
import axios from "axios";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Atom } from "react-loading-indicators";

function StockList() {
  const location = useLocation();
  const [res, setRes] = React.useState(null);
  const [ma50_data, setma50_data] = React.useState([]);
  const [rsi_data, setrsi_data] = React.useState([]);
  const [volume_data, setvolume_data] = React.useState([]);
  const [combined_data, setcombined_data] = React.useState([]);
  const [last_updated, setlast_updated] = React.useState("");
  const [unauthorized, setUnauthorized] = React.useState(
    localStorage.getItem("token") ? false : true
  );
  const [loading, setLoading] = React.useState(false);

  const token = localStorage.getItem("token");
  console.log("token is available ", token);
  const nodeStockURL = process.env.REACT_APP_NODE_STOCK_SERVICE_URL;
  console.log("url for stock service is ", nodeStockURL);

  const getStockData = async (token) => {
    setLoading(true);
    try {
      const res = await axios.get(nodeStockURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRes(res);
      console.log("total data is ", JSON.stringify(res.data[0]));
      setma50_data([
        ...res.data["ma50"]["bullish"],
        ...res.data["ma50"]["bearish"],
      ]);
      console.log("data is ", ma50_data);
      setrsi_data([
        ...res.data["rsi"]["bullish"],
        ...res.data["rsi"]["bearish"],
      ]);
      setvolume_data([
        ...res.data["volume"]["bullish"],
        ...res.data["volume"]["bearish"],
      ]);
      setcombined_data([
        ...res.data["combined"]["bullish"],
        ...res.data["combined"]["bearish"],
      ]);
      const readable_time = new Date(res.data["last_updated"]).toLocaleString(
        "en-US",
        {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      setlast_updated(readable_time);
      console.log("last updated is ", last_updated);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUnauthorized(true);
        localStorage.removeItem("token");
        setUnauthorized(true);
      }
    }
    setLoading(false);
  };

  const refreshStockData = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${nodeStockURL}/refresh`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRes(res);
      console.log("Refresh response data is ", JSON.stringify(res.data));
      setma50_data([
        ...res.data["ma50"]["bullish"],
        ...res.data["ma50"]["bearish"],
      ]);
      setrsi_data([
        ...res.data["rsi"]["bullish"],
        ...res.data["rsi"]["bearish"],
      ]);
      setvolume_data([
        ...res.data["volume"]["bullish"],
        ...res.data["volume"]["bearish"],
      ]);
      setcombined_data([
        ...res.data["combined"]["bullish"],
        ...res.data["combined"]["bearish"],
      ]);
      const readable_time = new Date(res.data["last_updated"]).toLocaleString(
        "en-US",
        {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      setlast_updated(readable_time);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUnauthorized(true);
        localStorage.removeItem("token");
        setUnauthorized(true);
      }
    }
    setLoading(false);
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
          <a href="/register" className="login-btn">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <Atom color="#2d35ccff" size="medium" text="" textColor="" />
      </div>
    );
  }

  return (
    <div className="stock-main-container">
      <div className="stock-list-header">
        <button
          className="refresh-btn"
          onClick={() => refreshStockData(localStorage.getItem("token"))}
        >
          🔄
        </button>
        <div className="last-updated">Last Updated: {last_updated}</div>
      </div>
      <div className="stock-list-row">
        <div className="stock-list-container">
          <h1 className="stock-list-container-title">Momentum-Indicator</h1>
          {ma50_data.map((stock, idx) => {
            return (
              <div
                className="stock-tile"
                key={idx}
                data-score={
                  stock["score"] > 1.5
                    ? "strong-positive"
                    : stock["score"] > 0
                    ? "positive"
                    : stock["score"] < -1.5
                    ? "negative"
                    : stock["score"] < 0
                    ? "negative"
                    : ""
                }
              >
                <Link to={`/stock/${stock["ticker"]}`}>
                  <h3>{stock["name"]}</h3>
                  <p>Close: ₹{stock["close"]}</p>
                  {stock["change"] < 0 ? (
                    <p className="change-negative">
                      Change: -₹{Math.abs(stock["change"])}
                    </p>
                  ) : (
                    <p className="change-positive">
                      Change: ₹{stock["change"]}
                    </p>
                  )}
                  {stock["pct_change"] < 0 ? (
                    <p className="change-negative">
                      Change Percentage: -{Math.abs(stock["pct_change"])}%
                    </p>
                  ) : (
                    <p className="change-positive">
                      Change Percentage: {stock["pct_change"]}%
                    </p>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="stock-list-container">
          <h1 className="stock-list-container-title">Price-Breakout</h1>
          {rsi_data.map((stock, idx) => (
            <div
              className="stock-tile"
              key={idx}
              data-score={
                stock["score"] > 1.5
                  ? "strong-positive"
                  : stock["score"] > 0
                  ? "positive"
                  : stock["score"] < -1.5
                  ? "negative"
                  : stock["score"] < 0
                  ? "negative"
                  : ""
              }
            >
              <Link to={`/stock/${stock["ticker"]}`}>
                <h3>{stock["name"]}</h3>
                <p>Close: ₹{stock["close"]}</p>
                {stock["change"] < 0 ? (
                  <p className="change-negative">
                    Change: -₹{Math.abs(stock["change"])}
                  </p>
                ) : (
                  <p className="change-positive">Change: ₹{stock["change"]}</p>
                )}
                {stock["pct_change"] < 0 ? (
                  <p className="change-negative">
                    Change Percentage: -{Math.abs(stock["pct_change"])}%
                  </p>
                ) : (
                  <p className="change-positive">
                    Change Percentage: {stock["pct_change"]}%
                  </p>
                )}{" "}
              </Link>
            </div>
          ))}
        </div>
        <div className="stock-list-container">
          <h1 className="stock-list-container-title">Volume-Based</h1>
          {volume_data.map((stock, idx) => (
            <div
              className="stock-tile"
              key={idx}
              data-score={
                stock["score"] > 1.5
                  ? "strong-positive"
                  : stock["score"] > 0
                  ? "positive"
                  : stock["score"] < -1.5
                  ? "negative"
                  : stock["score"] < 0
                  ? "negative"
                  : ""
              }
            >
              <Link to={`/stock/${stock["ticker"]}`}>
                <h3>{stock["name"]}</h3>
                <p>Close: ₹{stock["close"]}</p>
                {stock["change"] < 0 ? (
                  <p className="change-negative">
                    Change: -₹{Math.abs(stock["change"])}
                  </p>
                ) : (
                  <p className="change-positive">Change: ₹{stock["change"]}</p>
                )}
                {stock["pct_change"] < 0 ? (
                  <p className="change-negative">
                    Change Percentage: -{Math.abs(stock["pct_change"])}%
                  </p>
                ) : (
                  <p className="change-positive">
                    Change Percentage: {stock["pct_change"]}%
                  </p>
                )}{" "}
              </Link>
            </div>
          ))}
        </div>
        <div className="stock-list-container">
          <h1 className="stock-list-container-title">Final Data</h1>
          {combined_data.map((stock, idx) => (
            <div
              className="stock-tile"
              key={idx}
              data-score={
                stock["score"] > 1.5
                  ? "strong-positive"
                  : stock["score"] > 0
                  ? "positive"
                  : stock["score"] < -1.5
                  ? "negative"
                  : stock["score"] < 0
                  ? "negative"
                  : ""
              }
            >
              <Link to={`/stock/${stock["ticker"]}`}>
                <h3>{stock["name"]}</h3>
                <p>Close: ₹{stock["close"]}</p>
                {stock["change"] < 0 ? (
                  <p className="change-negative">
                    Change: -₹{Math.abs(stock["change"])}
                  </p>
                ) : (
                  <p className="change-positive">Change: ₹{stock["change"]}</p>
                )}
                {stock["pct_change"] < 0 ? (
                  <p className="change-negative">
                    Change Percentage: -{Math.abs(stock["pct_change"])}%
                  </p>
                ) : (
                  <p className="change-positive">
                    Change Percentage: {stock["pct_change"]}%
                  </p>
                )}{" "}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StockList;
