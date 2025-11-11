const express = require("express");
const AuthHandler = require("../middleware/AuthHandler");
const {
  FetchAllStockDiary,
  CreateStockDiaryEntry,
  FetchParticularStockDiaryEntry,
  EditStockDiaryEntry,
  DeleteStockDiaryEntry,
  FetchStockDiaryPagination,
} = require("../controller/StockDiaryController");
const router = express.Router();

// router.get("/", AuthHandler, FetchAllStockDiary);

router.get("/", AuthHandler, FetchStockDiaryPagination);

router.get("/:id", AuthHandler, FetchParticularStockDiaryEntry);

router.post("/", AuthHandler, CreateStockDiaryEntry);

router.put(`/:id`, AuthHandler, EditStockDiaryEntry);

router.delete(`/:id`, AuthHandler, DeleteStockDiaryEntry);

module.exports = router;
