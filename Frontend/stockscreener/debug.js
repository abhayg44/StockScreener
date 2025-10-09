const fs = require("fs");
const path = require("path");

console.log("--- Debug Info ---");

// Check if build directory exists
const buildPath = path.join(__dirname, "build");
if (fs.existsSync(buildPath)) {
  console.log("Build directory exists.");
  const files = fs.readdirSync(buildPath);
  console.log("Files in build:", files);
  if (files.includes("index.html")) {
    console.log("index.html found in build directory.");
  } else {
    console.log("index.html NOT found in build directory.");
  }
} else {
  console.log("Build directory does NOT exist.");
}

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log(".env file exists.");
} else {
  console.log(".env file does NOT exist.");
}
