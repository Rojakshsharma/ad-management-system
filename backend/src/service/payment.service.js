const prisma = require("../config/prisma.js");
const crypto = require("crypto");

const payOrder = async (advertiserId, orderId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.advertiserId !== advertiserId) {
      const error = new Error(
        "You can only pay for your own order"
      );
      error.statusCode = 403;
      throw error;
    }

    if (order.paymentStatus === "PAID") {
      const error = new Error("Order is already paid");
      error.statusCode = 400;
      throw error;
    }

    if (order.status === "CANCELLED") {
      const error = new Error("Cancelled order cannot be paid");
      error.statusCode = 400;
      throw error;
    }

    const transactionId = `TXN_${crypto.randomUUID()}`;

    const updatedOrder = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });

    return {
      order: updatedOrder,
      transactionId,
    };
  });
};

module.exports = {
  payOrder,
};