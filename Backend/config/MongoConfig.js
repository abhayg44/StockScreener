const mongoose = require("mongoose");

require("dotenv").config();

// console.log(process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "stock", 
    maxPoolSize:5,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    // console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });



module.exports = mongoose;
