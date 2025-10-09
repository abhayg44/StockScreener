const mongoose = require("../config/MongoConfig");
const dotenv = require("dotenv");
dotenv.config();

const stockEntrySchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  score: { type: Number, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  pct_change: { type: Number, required: true },
  name: { type: String, required: true },
});

const stockDirectionSchema = new mongoose.Schema({
  bullish: [stockEntrySchema],
  bearish: [stockEntrySchema],
});

const stockDataSchema = new mongoose.Schema({
  ma50: stockDirectionSchema,
  rsi: stockDirectionSchema,
  volume: stockDirectionSchema,
  combined: stockDirectionSchema,
  last_updated: { type: Date, default: Date.now },
});

const stockModel = mongoose.model(
  "stock",
  stockDataSchema,
  process.env.MONGO_COLLECTION || "stock_data"
);

module.exports = stockModel;
