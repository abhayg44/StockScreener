import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
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
        <Link to="/">Home</Link>
        {user && (
          <div>
            <Link to="/watchlist">Watchlist</Link>
            <Link to="/profile" user={user}>
              Profile
            </Link>
          </div>
        )}
        <Link to="/register">Register</Link>
      </nav>
    </div>
  );
}

export default Navbar;
