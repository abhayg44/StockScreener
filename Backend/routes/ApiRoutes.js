const express = require("express");
const AuthHandler = require("../middleware/AuthHandler");
const validatingToken = require("../controller/ApiController");
const router = express.Router();

router.post("/validate", AuthHandler, validatingToken);

module.exports = router;
