const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Ad space with this configuration already exists",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;