const rateLimit = require("express-rate-limit");

const RegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // max 5 requests per IP per window
  message: "Too many accounts created from this IP, please try again later",
});

module.exports = RegisterLimiter;
