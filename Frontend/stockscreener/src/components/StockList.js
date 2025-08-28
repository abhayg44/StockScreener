import React from "react";
import "./StockList.css";

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.45 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2735.55 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 312.12 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 3456.78 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 789.01 },
  { symbol: "META", name: "Meta Platforms", price: 355.67 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 412.34 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 650.23 },
];

function StockList() {
  return (
    <div className="stock-main-container">
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Momentum-Indicator</h1>
        {stocks.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock.symbol}</h3>
            <p>{stock.name}</p>
            <p>${stock.price}</p>
          </div>
        ))}
      </div>
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Price-Breakout</h1>
        {stocks.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock.symbol}</h3>
            <p>{stock.name}</p>
            <p>${stock.price}</p>
          </div>
        ))}
      </div>
      <div className="stock-list-container">
        <h1 className="stock-list-container-title">Volume-Based</h1>
        {stocks.map((stock, idx) => (
          <div className="stock-tile" key={idx}>
            <h3>{stock.symbol}</h3>
            <p>{stock.name}</p>
            <p>${stock.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockList;
