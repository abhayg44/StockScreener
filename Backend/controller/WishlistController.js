const { response } = require("express");

const getWishlistData = async (req, res) => {
  try {
    console.log("Fetching wishlist data...");
    const userId = req.query.user_id;
    console.log("query is ", req.query.user_id);
    if (!userId) {
      return res.status(400).json({
        message: "Bad Request",
        data: null,
        status: 401,
        error: "No user id given",
      });
    }
    console.log("User ID from token: ", req.user.userId);
    console.log("User ID from query: ", userId);
    if (String(req.user.userId) != String(userId)) {
      console.log("user id mismatch detected");
      return res.status(403).json({
        message: "Forbidden",
        data: null,
        status: 403,
        error: "user id and token mismatch",
      });
    }
    console.log("url is ", process.env.GO_BACKEND_URL + `/stock/wishlist`);
    const data = await fetch(
      process.env.GO_BACKEND_URL + `/stock/wishlist?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const wishlistData = await data.json();
    console.log("Wishlistdata is ", wishlistData);
    console.log("Status code is ", wishlistData.statusCode);

    if (wishlistData.statusCode !== 200) {
      console.log("Error response:", wishlistData.error);
      return res.status(wishlistData.statusCode).json({
        message: `Failed to fetch wishlist data in node side: ${wishlistData.message}`,
        status: wishlistData.statusCode,
        data: null,
        error: wishlistData.error,
      });
    }
    return res.status(200).json({
      message: "Wishlist data fetched successfully from node server",
      status: 200,
      data: wishlistData.data,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500,
      data: null,
      error: err.message,
    });
  }
};

const getIsWishlistData = async (req, res) => {
  try {
    console.log("Fetching iswishlist data...");
    const userId = req.query.user_id;
    const ticker = req.query.ticker;
    if (!userId || !ticker) {
      return res.status(400).json({
        message: "Bad Request",
        status: 400,
        error: "No user id or ticker given",
        data: null,
      });
    }
    console.log("user id and user_id are ", req.user.userId, userId);
    if (String(req.user.userId) != String(userId)) {
      return res.status(403).json({
        message: "Forbidden",
        status: 403,
        error: "user id and token mismatch",
        data: null,
      });
    }
    const response = await fetch(
      process.env.GO_BACKEND_URL +
        `/stock/iswishlist?user_id=${userId}&ticker=${ticker}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (response.status !== 200) {
      return res.status(500).json({
        message: "Failed to fetch iswishlist data",
        status: 500,
        error: data.error,
      });
    }
    console.log("iswishlist data is ", data.data);
    if (data.data["is_wishlisted"] == false) {
      return res.status(200).json({
        message: "not wishlisted",
        status: 200,
        error: null,
      });
    } else {
      return res.status(200).json({
        message: "is wishlisted",
        status: 200,
        error: null,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message, status: 500, error: err.message });
  }
};

const sendWishlistData = async (req, res) => {
  try {
    console.log("Storing wishlist data...");
    const userId = req.query.user_id;
    const wishlist = req.body;
    console.log("request body is ", req.body);
    console.log("wishlist data is ", JSON.stringify(wishlist));
    console.log("type of change is ", typeof wishlist["change"]);
    console.log(
      "complete url ",
      process.env.GO_BACKEND_URL + `/stock/wishlist?user_id=${userId}`
    );
    if (!userId || !wishlist) {
      return res.status(400).json({
        message: "Bad Request",
        status: 400,
        error: "No user id or wishlist data given",
        data: null,
      });
    }
    if (String(req.user.userId) != String(userId)) {
      return res.status(403).json({
        message: "Forbidden",
        status: 403,
        error: "user id and token mismatch",
        data: null,
      });
    }
    const response = await fetch(
      process.env.GO_BACKEND_URL + `/stock/wishlist?user_id=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wishlist),
      }
    );
    const data = await response.json();
    console.log("Response from Go backend:", data);
    if (data.statusCode == 200 || data.statusCode == 201) {
      return res.status(200).json({
        message: "Wishlist data stored successfully from node server",
        status: 200,
        data: null,
        error: null,
      });
    } else {
      if (data.message === "exists") {
        return res.status(409).json({
          message: "Wishlist item already exists",
          status: 409,
          error: "Wishlist item already exists",
          data: null,
        });
      } else {
        return res.status(data.statusCode).json({
          message: `Failed to store wishlist data from go ${data.message}`,
          error: `Error from go ${data.error}`,
          status: data.statusCode,
          data: null,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteWishlistData = async (req, res) => {
  try {
    console.log("Deleting wishlist data...");
    const userId = req.query.user_id;
    const ticker = req.query.ticker;
    if (!userId || !ticker) {
      return res.status(400).json({
        message: "Bad Request",
        status: 400,
        error: "No user id or ticker given",
        data: null,
      });
    }
    console.log("user id and user_id are ", req.user.userId, userId);
    if (String(req.user.userId) != String(userId)) {
      return res.status(403).json({
        message: "Forbidden",
        status: 403,
        error: "user id and token mismatch",
        data: null,
      });
    }
    const response = await fetch(
      process.env.GO_BACKEND_URL +
        `/stock/wishlist?user_id=${userId}&ticker=${ticker}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (response.status !== 200) {
      return res.status(500).json({
        message: "Failed to delete wishlist data",
        status: 500,
        error: data.error,
      });
    }
    return res.status(200).json({
      message: data.message,
      status: 200,
      error: null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getWishlistData,
  sendWishlistData,
  deleteWishlistData,
  getIsWishlistData,
};
