const paymentService = require("../service/payment.service.js");

const payOrderController = async (req, res, next) => {
  try {
    const result = await paymentService.payOrder(
      req.user.userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Payment successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  payOrderController,
};