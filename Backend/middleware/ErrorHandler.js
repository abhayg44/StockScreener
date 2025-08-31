const express = require("express");

const ErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode;
  switch (statusCode) {
    case 400:
      res.json({ message: err.message, stackTrace: err.stack });
      break;
    case 401:
      res.json({ message: err.message, stackTrace: err.stack });
      break;
    case 404:
      res.json({ message: err.message, stackTrace: err.stack });
      break;
    case 500:
      res.json({ message: err.message, stackTrace: err.stack });
      break;
  }
};

module.exports = ErrorHandler;
