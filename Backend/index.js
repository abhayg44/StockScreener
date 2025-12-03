const express = require("express");
const ErrorHandler = require("./middleware/ErrorHandler");
const cors = require("cors");
const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://frontend-image-yb47.onrender.com",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options(/(.*)/, cors(corsOptions));

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
