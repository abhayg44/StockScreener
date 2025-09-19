const express = require("express");
const {
  getStockData,
  refreshStockData,
} = require("../controller/StockController");
const AuthHandler = require("../middleware/AuthHandler");
const router = express.Router();

router.get("/", AuthHandler, getStockData);
router.get("/refresh", AuthHandler, refreshStockData);

module.exports = router;
