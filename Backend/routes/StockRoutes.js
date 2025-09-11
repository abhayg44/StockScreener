const express = require("express");
const { getStockData } = require("../controller/StockController");
const AuthHandler = require("../middleware/AuthHandler");
const router = express.Router();

router.get("/", AuthHandler, getStockData);

module.exports = router;
