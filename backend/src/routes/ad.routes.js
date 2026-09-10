const express = require("express");

const {
  createAdController,
  getMyAdsController,
  updateAdController,
} = require("../controller/ad.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");
const validate = require("../middleware/validate.middleware.js");
const upload = require("../middleware/upload.middleware.js");

const {
  createAdSchema,
  updateAdSchema,
} = require("../validators/ad.validator.js");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADVERTISER"));

router.post(
  "/",
  upload.single("image"),
  validate(createAdSchema),
  createAdController
);

router.get(
  "/my",
  getMyAdsController
);

router.put(
  "/:id",
  upload.single("image"),
  validate(updateAdSchema),
  updateAdController
);

module.exports = router;