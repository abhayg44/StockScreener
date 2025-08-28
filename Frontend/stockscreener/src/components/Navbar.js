import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Stock Screener</div>
      <input
        className="navbar-search"
        type="text"
        placeholder="Search stocks..."
      />
      <ul className="navbar-links">
        <li>Home</li>
        <li>Watchlist</li>
        <li>Profile</li>
      </ul>
    </nav>
  );
}

export default Navbar;
