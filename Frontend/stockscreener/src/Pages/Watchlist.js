import React, { useEffect, useState } from "react";
import axios from "axios";
import { Atom } from "react-loading-indicators";
import "./Watchlist.css";

function Watchlist() {
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [wishlist, setWishlist] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const userObject = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userObject || !token) {
      setIsLoading(false);
      setUnauthorized(true);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      const userId = JSON.parse(userObject).id;

      const fetchWishlist = async () => {
        try {
          // console.log(
          //   "fetching data from url ",
          //   process.env.REACT_APP_NODE_WISHLIST_URL + `?user_id=${userId}`
          // );
          // console.log("user id is ", userId);

          const response = await axios.get(
            process.env.REACT_APP_NODE_WISHLIST_URL + `?user_id=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          // console.log("response: is ", response);
          // console.log("response.data is ", response.data);
          setIsLoading(false);
          if (response.data.error !== null) {
            setUnauthorized(true);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          } else {
            setWishlist(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
          setIsLoading(false);
          setError(error.message);
        }
      };
      fetchWishlist();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <Atom color="#2d35ccff" size="medium" text="" textColor="" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      {unauthorized ? (
        <div className="unauthorized-container">
          <div className="unauthorized-card">
            <h2>🔒 Access Required</h2>
            <p>
              Please log in to view your watchlist and track your favorite
              stocks.
            </p>
            <div className="auth-buttons">
              <a href="/login" className="auth-btn">
                Login
              </a>
              <a href="/register" className="auth-btn secondary">
                Sign Up
              </a>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="watchlist-content">
          <div className="watchlist-header">
            <h1 className="watchlist-title">📊 My Watchlist</h1>
            <p className="watchlist-subtitle">
              Stocks that you have added to your watchlist for quick access.
            </p>
            <p className="stock-count">
              {wishlist?.length || 0}{" "}
              {wishlist?.length === 1 ? "stock" : "stocks"} tracked
            </p>
          </div>

          {wishlist && wishlist.length > 0 ? (
            <div className="stocks-grid">
              {wishlist.map((item) => (
                <a
                  key={item.ticker}
                  href={`/stock/${item.ticker}`}
                  className="stock-card"
                >
                  <div className="stock-header">
                    <div className="stock-info">
                      <h3 className="stock-name">{item.name}</h3>
                      <span className="stock-ticker">{item.ticker}</span>
                    </div>
                    <div className="stock-price-section">
                      <div className="stock-price">
                        ₹{item.close_price?.toLocaleString()}
                      </div>
                      <div
                        className={`stock-change ${
                          item.change > 0
                            ? "positive"
                            : item.change < 0
                            ? "negative"
                            : "neutral"
                        }`}
                      >
                        {item.change > 0 ? "+" : ""}₹{item.change}
                      </div>
                    </div>
                  </div>
                  <div className="stock-footer">
                    <span className="view-details">View Details →</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-watchlist">
              <div className="empty-icon">📈</div>
              <h3 className="empty-title">Your watchlist is empty</h3>
              <p className="empty-description">
                Start building your portfolio by adding stocks you want to
                track.
              </p>
              <a href="/" className="browse-stocks-btn">
                Browse Stocks
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Watchlist;
