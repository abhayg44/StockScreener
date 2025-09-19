const express = require("express");
const stockModel = require("../models/Stock");

const getStockData = async (req, res) => {
  try {
    console.log(stockModel);
    console.log("Fetching stock data...");
    const stockData = await stockModel
      .findOne({})
      .sort({ last_updated: -1, _id: -1 });
    console.log(stockData);
    res.status(200).json(stockData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refreshStockData = async (req, res) => {
  try {
    console.log("Refreshing stock data...");
    const goRes = await fetch(
      process.env.GO_BACKEND_URL + "/stock/refresh-stock-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await goRes.json();
    console.log("Data from GO backend is ", data);
    if (goRes.status !== 200) {
      return res.status(500).json({
        message: "Failed to refresh stock data please try again later",
      });
    } else {
      if (data.data === "null") {
        return res.status(500).json({
          message: "Failed to refresh stock data please try again later",
        });
      } else {
        return res.status(200).json(data);
      }
    }
  } catch (error) {
    console.error("Error refreshing stock data: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getStockData,
  refreshStockData,
};
