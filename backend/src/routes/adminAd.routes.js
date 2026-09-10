const express = require("express");

const {
  getAdminAdsController,
  updateAdStatusController,
} = require("../controller/ad.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");
const validate = require("../middleware/validate.middleware.js");

const {
  adminAdsQuerySchema,
  updateAdStatusSchema,
} = require("../validators/ad.validator.js");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get(
  "/",
  validate(adminAdsQuerySchema, "query"),
  getAdminAdsController
);

router.put(
  "/:id/status",
  validate(updateAdStatusSchema),
  updateAdStatusController
);

module.exports = router;