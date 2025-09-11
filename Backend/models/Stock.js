const mongoose = require("../config/MongoConfig");
const dotenv = require("dotenv");
dotenv.config();

const stockSchema = new mongoose.Schema({
  type: { type: String, default: "latest" },
  data: { type: Object, required: true },
  date: { type: Date, default: Date.now },
});

const stockModel = mongoose.model(
  "Stock",
  stockSchema,
  process.env.MONGO_COLLECTION || "stock_data"
);

module.exports = stockModel;
