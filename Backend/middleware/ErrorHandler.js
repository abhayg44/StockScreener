const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  switch (err.code) {
    case "23505": // Unique violation (e.g., duplicate email)
      res.status(400).json({ message: "Email already in use" });
      break;
    case "23503": // Foreign key violation
      res.status(400).json({ message: "Invalid reference" });
      break;
    default:
      res.status(500).json({ message: "Server error" });
  }
};

module.exports = errorHandler;
