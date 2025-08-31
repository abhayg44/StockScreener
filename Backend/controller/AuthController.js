const pool = require("../config/DbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const express = require("express");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log("request body is", req.body);
  //check if user exists
  const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userCheck.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert new user
  const newUser = await pool.query(
    "INSERT INTO users (name,email, password) VALUES ($1, $2, $3) RETURNING id, email",
    [name, email, hashedPassword]
  );

  // create token
  const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });

  // return user and token
  res.status(201).json({ user: newUser.rows[0], token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userResult.rows.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid credentials or Account does not exist" });
  }

  const user = userResult.rows[0];

  // check password
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
