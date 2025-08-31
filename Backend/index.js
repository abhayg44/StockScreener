const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", require("./routes/AuthRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
