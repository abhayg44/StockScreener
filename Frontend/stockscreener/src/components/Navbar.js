import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/register">Register</Link>
      </nav>
    </div>
  );
}

export default Navbar;
