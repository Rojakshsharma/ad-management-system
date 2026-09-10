const express = require("express");

const {
  getAvailabilityController,
} = require("../controller/placement.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADVERTISER"));

router.get(
  "/availability",
  getAvailabilityController
);

module.exports = router;