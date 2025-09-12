const express = require("express");
const ErrorHandler = require("./middleware/ErrorHandler");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./config/MongoConfig");
app.use("/users", require("./routes/AuthRoutes"));
app.use("/profile", require("./routes/UserRoutes"));
app.use("/stock", require("./routes/StockRoutes"));
app.use("/api", require("./routes/ApiRoutes"));
app.use(ErrorHandler);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
