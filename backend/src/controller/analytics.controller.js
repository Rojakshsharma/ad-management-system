const analyticsService = require("../service/analytics.service.js");

const getAdvertiserAnalyticsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await analyticsService.getAdvertiserAnalytics(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalyticsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await analyticsService.getAdminAnalytics();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAdvertiserDashboardController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await analyticsService.getAdvertiserDashboard(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvertiserAnalyticsController,
  getAdminAnalyticsController,
  getAdvertiserDashboardController,
};