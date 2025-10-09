const express = require("express");
const {
  getStockData,
  refreshStockData,
} = require("../controller/StockController");
const {
  getWishlistData,
  sendWishlistData,
  deleteWishlistData,
  getIsWishlistData,
} = require("../controller/WishlistController");
const AuthHandler = require("../middleware/AuthHandler");
const router = express.Router();

router.get("/", AuthHandler, getStockData);
router.get("/refresh", AuthHandler, refreshStockData);
router.get("/wishlist", AuthHandler, getWishlistData);
router.get("/iswishlist", AuthHandler, getIsWishlistData);
router.post("/wishlist", AuthHandler, sendWishlistData);
router.delete("/wishlist", AuthHandler, deleteWishlistData);

module.exports = router;
