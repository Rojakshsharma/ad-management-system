const express = require("express");

const {
  getPricingRulesController,
  createPricingRuleController,
  updatePricingRuleController,
} = require("../controller/pricingRule.controller.js");

const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");
const  validate = require("../middleware/validate.middleware.js");
const { pricingRuleSchema } = require("../validators/pricingRule.validator.js");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get("/", getPricingRulesController);

router.post("/", validate(pricingRuleSchema), createPricingRuleController);

router.put("/:id", validate(pricingRuleSchema), updatePricingRuleController);

module.exports = router;