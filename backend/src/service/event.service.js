const prisma = require("../config/prisma.js");

const createEvent = async ({
  adId,
  orderId,
  adSpaceId,
  eventType,
  startedAt,
  endedAt,
}) => {
  const ad = await prisma.ad.findUnique({
    where: {
      id: adId,
    },
  });

  if (!ad) {
    const error = new Error("Ad not found");
    error.statusCode = 404;
    throw error;
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    order.adId !== adId ||
    order.adSpaceId !== adSpaceId
  ) {
    const error = new Error("Invalid ad event data");
    error.statusCode = 400;
    throw error;
  }

  if (
    order.status !== "CONFIRMED" ||
    order.paymentStatus !== "PAID"
  ) {
    const error = new Error(
      "Events can only be recorded for paid orders"
    );
    error.statusCode = 400;
    throw error;
  }

  const event = await prisma.adEvent.create({
    data: {
      adId,
      orderId,
      adSpaceId,
      eventType,
      startedAt: startedAt
        ? new Date(startedAt)
        : null,
      endedAt: endedAt
        ? new Date(endedAt)
        : null,
    },
  });

  return event;
};

module.exports = {
  createEvent,
};