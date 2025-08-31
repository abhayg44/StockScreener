const express = require("express");
const { signup, login } = require("../controller/AuthController");
const RegisterLimiter = require("../middleware/RateLimiter");
const router = express.Router();
const app = express();

router.post("/signup", RegisterLimiter, signup);
router.post("/login", RegisterLimiter, login);

module.exports = router;
