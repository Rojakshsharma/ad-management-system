const express = require("express");

const {
  getAdvertiserAnalyticsController,
  getAdminAnalyticsController,
  getAdvertiserDashboardController,
} = require("../controller/analytics.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");

const router = express.Router();

router.get(
  "/advertiser",
  authMiddleware,
  roleMiddleware("ADVERTISER"),
  getAdvertiserAnalyticsController
);

router.get(
  "/advertiser/dashboard",
  authMiddleware,
  roleMiddleware("ADVERTISER"),
  getAdvertiserDashboardController
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAdminAnalyticsController
);

module.exports = router;