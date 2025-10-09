const validatingToken = (req, res) => {
  // AuthHandler has already verified the token
  // and attached req.user (from decoded token)
  return res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
};

module.exports = validatingToken;
