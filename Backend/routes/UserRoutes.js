const express = require("express");
const { getProfile, editProfile } = require("../controller/ProfileController");
const AuthHandler = require("../middleware/AuthHandler");
const router = express.Router();

router.get("/", AuthHandler, getProfile);
router.put("/", AuthHandler, editProfile);

module.exports = router;
