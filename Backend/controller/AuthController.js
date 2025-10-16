const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const express = require("express");
const supabase = require("../config/DbConfig");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log("request body is", req.body);
  //check if user exists
  const { data: existingUser, error: userError } = await supabase
    .from("stock_screener_users")
    .select("*")
    .eq("email", email)
    .single();

  console.log("Data from supabase is ", existingUser);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert new user
  const { data: newUser, error: insertError } = await supabase
    .from("stock_screener_users")
    .insert([{ name, email, password: hashedPassword }])
    .select("id, email")
    .single();

  console.log("New user data is ", newUser);

  if (insertError) {
    return res
      .status(500)
      .json({ message: "Error creating user", error: insertError.message });
  }

  // create token
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });

  // return user and token
  res.status(201).json({ user: newUser.id, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error: userError } = await supabase
    .from("stock_screener_users")
    .select("*")
    .eq("email", email)
    .single();

  console.log("User data from supabase is ", user);
  if (userError) {
    if (userError.details == "The result contains 0 rows") {
      return res.status(400).json({ message: "Account does not exist" });
    } else {
      return res.status(500).json({ message: "Error fetching user" });
    }
  }

  if (!user) {
    return res
      .status(500)
      .json({ message: "Server side error ", message: userError.message });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid credentials, Please check your password" });

  // create token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });

  res.json({ user: { id: user.id, email: user.email }, token });
});

module.exports = { signup, login };
