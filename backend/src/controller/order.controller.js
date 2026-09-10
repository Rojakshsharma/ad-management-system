const orderService = require("../service/order.service.js");

const createOrderController = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Placement reserved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrdersController = async (req, res, next) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const result = await orderService.getMyOrders(
      req.user.userId,
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderByIdController = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.user.userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrderController,
  getMyOrdersController,
  getOrderByIdController,
};