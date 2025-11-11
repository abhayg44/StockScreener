const express = require("express");
const ErrorHandler = require("./middleware/ErrorHandler");
const cors = require("cors");
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-image-yb47.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, origin);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Your API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./config/MongoConfig");
app.use("/users", require("./routes/AuthRoutes"));
app.use("/profile", require("./routes/UserRoutes"));
app.use("/stock", require("./routes/StockRoutes"));
app.use("/api", require("./routes/ApiRoutes"));
app.use("/stockdiary", require("./routes/StockDiaryRoutes"));

app.use(ErrorHandler);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
