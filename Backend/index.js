const express = require("express");
const ErrorHandler = require("./middleware/ErrorHandler");
const cors = require("cors");
const app = express();

// Set up trust proxy for Render (good practice)
app.set("trust proxy", 1);

// 1. Define the single allowed origin (as a string)
const allowedOrigin = "https://frontend-image-yb47.onrender.com";

// 2. Define the secure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow the specific origin OR requests with no origin (e.g., Postman)
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  // 🚨 CRITICAL FIX: Must be true to allow cookies/JWTs cross-domain
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 200,
};

// 3. Apply the secure CORS middleware
app.use(cors(corsOptions));

// 4. 🚨 CRITICAL FIX: Handle Preflight OPTIONS requests with the secure options
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
