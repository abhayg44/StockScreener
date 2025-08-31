import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user }) {
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
        {user ? (
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
