const express = require("express");
const { signup, login } = require("../controller/AuthController");
const errorHandler = require("../middleware/ErrorHandler");
const router = express.Router();
const app = express();

router.post("/signup", signup);
router.post("/login", login);
app.use(errorHandler);

module.exports = router;
