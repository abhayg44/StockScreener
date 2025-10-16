const supabase = require("../config/DbConfig");
const asyncHandler = require("express-async-handler");

//get user profile
const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const { data: userResult, error: userError } = await supabase
    .from("stock_screener_users")
    .select("*")
    .eq("id", userId)
    .single();
  console.log("User result is ", userResult);
  if (userError) {
    return res
      .status(500)
      .json({ message: "Error fetching user", error: userError.message });
  }

  if (!userResult) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: userResult });
});

const editProfile = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { name } = req.body;
  if (!userId || !name) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const { data: userResult, error: userError } = await supabase
    .from("stock_screener_users")
    .update({ name })
    .eq("id", userId)
    .select()
    .single();
  console.log(
    "Updated user result is ",
    userResult,
    " userid is ",
    userId,
    " name is ",
    name
  );
  if (userError) {
    return res
      .status(500)
      .json({ message: "Error updating user", error: userError.message });
  }

  if (!userResult) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: userResult });
});

module.exports = { getProfile, editProfile };
