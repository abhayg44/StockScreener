import React from "react";
import StockList from "../components/StockList";
import "./HomePage.css";

function HomePage() {
  return (
    <div>
      <div className="homepage-info-box">
        <p>
          Stock Screener helps you to identify stocks that have a high potential
          of money movement based on various technical indicators and market
          trends.
          <br />
          <br />
          Below are some of the stocks that are identified by our screener.
          <br />
          <br />
          Note: This is not based of dynamic data and does not guarantee future
          performance. Please do your own research before making any investment
          decisions. Thank you have a great trading day!
        </p>
      </div>
      <StockList />
    </div>
  );
}

export default HomePage;
