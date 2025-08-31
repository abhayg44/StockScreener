const pool = require("../config/DbConfig");
const asyncHandler = require("express-async-handler");

//get user profile
const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const userResult = await pool.query(
    "SELECT id, name, email FROM users WHERE id=$1",
    [userId]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: userResult.rows[0] });
});

const editProfile = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { name } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const userResult = await pool.query(
    "UPDATE users SET name=$1 WHERE id=$2 RETURNING id, name, email",
    [name, userId]
  );

  if (userResult.rows.length == 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: userResult.rows[0] });
});

module.exports = { getProfile, editProfile };
