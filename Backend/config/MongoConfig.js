const mongoose = require("mongoose");

require("dotenv").config();

console.log(process.env.MONGO_URL);

mongoose
  .connect(
    process.env.MONGO_URL ||
      "mongodb+srv://StockScreenerFinal:StockScreener2025@cluster0.b3gqgzr.mongodb.net/stock?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "stock", // explicitly select the DB
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

module.exports = mongoose;
