const {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
} = require("../service/pricingRule.service.js");

const getPricingRulesController = async (req, res, next) => {
  try {
    const { adSpaceId } = req.query;

    const rules = await getPricingRules(adSpaceId);

    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

const createPricingRuleController = async (req, res, next) => {
  try {
    const rule = await createPricingRule(req.body);

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

const updatePricingRuleController = async (req, res, next) => {
  try {
    const rule = await updatePricingRule(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPricingRulesController,
  createPricingRuleController,
  updatePricingRuleController,
};