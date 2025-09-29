import React, { useEffect, useState } from "react";
import axios from "axios";
import { Atom } from "react-loading-indicators";

function Watchlist() {
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [wishlist, setWishlist] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userString || !token) {
      setIsLoading(false);
      setUnauthorized(true);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      const userId = JSON.parse(userString).id;

      const fetchWishlist = async () => {
        try {
          console.log(
            "fetching data from url ",
            process.env.REACT_APP_NODE_WISHLIST_URL + `?user_id=${userId}`
          );
          console.log("user id is ", userId);

          const response = await axios.get(
            process.env.REACT_APP_NODE_WISHLIST_URL + `?user_id=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("response: is ", response);
          console.log("response.data is ", response.data);
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
    <div>
      {unauthorized ? (
        <div>
          <h2>Please log in to view your watchlist.</h2>
          <a href="/register">Go to Login</a>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>Your Watchlist</h2>
          <ul>
            {wishlist.map((item) => (
              <a
                href={`/stock/${item.ticker}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <li key={item.ticker}>
                  {item.name} - {item.ticker} - Rs.{item.close_price} - Rs.
                  {item.change}
                </li>
              </a>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Watchlist;
