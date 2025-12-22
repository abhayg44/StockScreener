const express = require("express");

const FetchAllStockDiary = async (req, res) => {
  try {
    console.log(
      "Inside fetch all stock diary controller",
      process.env.GO_BACKEND_URL + `/stockdiary?user_id=${req.user.userId}`
    );
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        status: 401,
        data: null,
        error: "No user ID found",
      });
    }
    const data = await fetch(
      process.env.GO_BACKEND_URL + `/stockdiary?user_id=${req.user.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const stockDiaryData = await data.json();
    console.log("stock diary data from golang side is ", stockDiaryData);
    if (stockDiaryData.statusCode !== 200) {
      return res.status(stockDiaryData.statusCode).json({
        message: `Failed to fetch wishlist data in golang side`,
        status: stockDiaryData.statusCode,
        data: null,
        error: stockDiaryData.error,
      });
    } else {
      return res.status(200).json({
        message: "Successfull",
        status: 200,
        data: stockDiaryData.data,
        error: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

const FetchStockDiaryPagination = async (req, res) => {
  try {
    page = req.query.page;
    limit = req.query.limit;
    console.log("page is ", page);
    console.log("limit is ", limit);
    const data = await fetch(
      process.env.GO_BACKEND_URL +
        `/stockdiary?user_id=${req.user.userId}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const stockDiaryData = await data.json();
    console.log("stock diary data from golang side is ", stockDiaryData);
    if (stockDiaryData.statusCode !== 200) {
      return res.status(stockDiaryData.statusCode).json({
        message: `Failed to fetch wishlist data in golang side`,
        status: stockDiaryData.statusCode,
        data: null,
        error: stockDiaryData.error,
      });
    } else {
      return res.status(200).json({
        message: "Successfull",
        status: 200,
        data: stockDiaryData.data,
        error: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

const FetchParticularStockDiaryEntry = async (req, res) => {
  try {
    const response = await fetch(
      process.env.GO_BACKEND_URL +
        `/stockdiary/${req.params.id}?user_id=${req.user.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const stockDiaryData = await response.json();
    console.log("stock diary data from golang side is ", stockDiaryData);
    if (stockDiaryData.statusCode !== 200) {
      return res.status(stockDiaryData.statusCode).json({
        message: `Failed to fetch wishlist data in golang side`,
        status: stockDiaryData.statusCode,
        data: null,
        error: stockDiaryData.error,
      });
    } else {
      return res.status(200).json({
        message: "Successfull",
        status: 200,
        data: stockDiaryData.data,
        error: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

const CreateStockDiaryEntry = async (req, res) => {
  try {
    console.log(
      "inside create block go url ",
      process.env.GO_BACKEND_URL + "/stockdiary"
    );
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        status: 401,
        data: null,
        error: "No user ID found",
      });
    }
    const now = new Date();
    if (
      !req.body.stock_symbol ||
      !req.body.entry_price ||
      !req.body.entry_time ||
      !req.body.exit_time ||
      !req.body.exit_price
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        status: 400,
        data: null,
        error:
          "Required fields: stock_symbol, entry_price, exit_price, entry_time, exit_time",
      });
    }
    const nodeBody = {
      user_id: req.user.userId.toString(),
      stock_symbol: req.body.stock_symbol,
      entry_price: req.body.entry_price,
      exit_price: req.body.exit_price,
      entry_time: req.body.entry_time,
      exit_time: req.body.exit_time,
      description: req.body.description,
      created_at: now,
      updated_at: now,
    };
    console.log("body is ", nodeBody);
    const response = await fetch(process.env.GO_BACKEND_URL + "/stockdiary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nodeBody),
    });
    if (response.status !== 200) {
      const errorData = await response.json();
      console.log("error data from golang side ", errorData);
      return res.status(response.status).json({
        message: `Failed to create stock diary entry in golang side`,
        status: response.status,
        data: null,
        error: errorData.error,
      });
    }
    console.log("data of body is ", req.body);
    const data = await response.json();
    console.log(
      "data from golang side after creating stock diary entry ",
      data
    );
    res.status(200).json({
      message: data.message,
      status: 200,
      data: data.data,
      error: null,
    });
  } catch (err) {
    console.log("error in creating stock diary entry ", err);
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

const EditStockDiaryEntry = async (req, res) => {
  try {
    if (!req.user.userId || !req.user) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        status: 401,
        data: null,
        error: "No user ID found",
      });
    }
    const body = req.body;
    const now = new Date();
    body.updated_at = now;
    console.log("body is ", body);
    const response = await fetch(
      process.env.GO_BACKEND_URL +
        `/stockdiary/${req.params.id}?user_id=${req.user.userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );
    if (response.status !== 200) {
      console.log("response is ", response);
      if (response.status == 204) {
        return res.status(200).json({
          message: `No Changes Detected`,
          status: 200,
          data: null,
          error: null,
        });
      }
      const errorData = await response.json();
      console.log("error data from golang side ", errorData);
      return res.status(response.status).json({
        message: `Failed to edit stock diary entry in golang side`,
        status: response.status,
        data: null,
        error: errorData.error,
      });
    }
    const data = await response.json();
    console.log("data from golang side after editing stock diary entry ", data);
    res.status(200).json({
      message: data.message,
      status: 200,
      data: data.Data,
      error: null,
    });
  } catch (err) {
    console.log("error in editing stock diary entry ", err);
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

const DeleteStockDiaryEntry = async (req, res) => {
  try {
    const response = await fetch(
      process.env.GO_BACKEND_URL +
        `/stockdiary/${req.params.id}?user_id=${req.user.userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      const errorData = await response.json();
      console.log("error data from golang side ", errorData);
      return res.status(response.status).json({
        message: `Failed to delete stock diary entry in golang side`,
        status: response.status,
        data: null,
        error: errorData.error,
      });
    }
    const data = await response.json();
    res.status(200).json({
      message: data.message,
      status: 200,
      data: data.Data,
      error: null,
    });
  } catch (err) {
    console.log("error in deleting stock diary entry ", err);
    return res.status(500).json({
      message: `error in node ${err}`,
      status: 500,
      data: null,
      error: err,
    });
  }
};

module.exports = {
  FetchAllStockDiary,
  CreateStockDiaryEntry,
  FetchParticularStockDiaryEntry,
  EditStockDiaryEntry,
  DeleteStockDiaryEntry,
  FetchStockDiaryPagination,
};
