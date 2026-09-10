const publicService = require("../service/public.service.js");

const getActiveAdController = async (req, res, next) => {
  try {
    const result = await publicService.getActiveAd({
      pageNumber: Number(req.query.pageNumber),
      position: req.query.position,
      size: req.query.size,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No active ad found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAdController,
};