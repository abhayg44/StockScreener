import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [unauthorized, setUnauthorized] = React.useState(
    localStorage.getItem("token") ? false : true
  );
  var token = localStorage.getItem("token");
  useEffect(() => {
    token = localStorage.getItem("token");
    if (token) {
      setUnauthorized(false);
    } else {
      setUnauthorized(true);
    }
  }, [token]);
  return (
    <div className="navbar">
      <nav className="navbar-logo">
        <Link to="/">Stock Screener</Link>
      </nav>
      <input
        className="navbar-search"
        type="text"
        placeholder="Search stocks..."
      />
      <nav className="navbar-links">
        <Link to="/" className="navbar-links-home">
          Home
        </Link>
        {!unauthorized ? (
          <div className="navbar-links">
            <Link to="/watchlist">Watchlist</Link>
            <Link to="/profile">Profile</Link>
          </div>
        ) : (
          <Link to="/register">Register</Link>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
