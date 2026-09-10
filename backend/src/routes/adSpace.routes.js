const express = require("express");

const {
  getAdSpaces,
  createAdSpace,
  updateAdSpace,
} = require("../controller/adSpace.controller.js");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createAdSpaceSchema,
  updateAdSpaceSchema,
} = require("../validators/adSpace.validator");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get("/", getAdSpaces);

router.post(
  "/",
  validate(createAdSpaceSchema),
  createAdSpace
);

router.put(
  "/:id",
  validate(updateAdSpaceSchema),
  updateAdSpace
);

module.exports = router;