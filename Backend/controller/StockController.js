const express = require("express");
const stockModel = require("../models/Stock");

const getStockData = async (req, res) => {
  try {
    console.log(stockModel);
    console.log("Fetching stock data...");
    const stockData = await stockModel.find({});
    console.log(stockData);
    res.status(200).json(stockData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStockData,
};
