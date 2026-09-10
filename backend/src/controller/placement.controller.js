const placementService = require("../service/placement.service.js");

const getAvailabilityController = async (req, res, next) => {
  try {
    const result = await placementService.getAvailability({
      pageNumber: Number(req.query.pageNumber),
      position: req.query.position,
      size: req.query.size,
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailabilityController,
};