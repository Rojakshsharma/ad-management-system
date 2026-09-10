const express = require("express");

const {
  createOrderController,
  getMyOrdersController,
  getOrderByIdController,
} = require("../controller/order.controller.js");
const {
  payOrderController,
} = require("../controller/payment.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");
const validate = require("../middleware/validate.middleware.js");

const {
  createOrderSchema,
} = require("../validators/order.validator.js");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADVERTISER"));

router.post(
  "/",
  validate(createOrderSchema),
  createOrderController
);

router.post(
  "/:id/pay",
  payOrderController
);

router.get(
  "/",
  getMyOrdersController
);

router.get(
  "/:id",
  getOrderByIdController
);

module.exports = router;