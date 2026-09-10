const prisma = require("../config/prisma.js");

const WINDOW_SECONDS = 120;

const generateSchedule = async (orderId, tx = prisma) => {
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

  const existingSlots = await tx.scheduledSlot.findMany({
    where: {
      orderId,
      status: {
        in: ["SCHEDULED", "SERVED"],
      },
    },
  });

  // Make scheduler safe to run multiple times
  if (existingSlots.length > 0) {
    return existingSlots;
  }

  const dayStart = new Date(order.date);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  // Get all orders for this placement/date
  const orders = await tx.order.findMany({
    where: {
      adSpaceId: order.adSpaceId,
      date: order.date,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  /*
   * Build the rotation queue.
   *
   * Each order gets broken into 2-minute windows.
   */
  const queues = orders.map((currentOrder) => ({
    order: currentOrder,
    remaining: currentOrder.durationSeconds,
  }));

  const slots = [];

  let cursor = dayStart;
  let queueIndex = 0;

  while (
    cursor < dayEnd &&
    queues.some((item) => item.remaining > 0)
  ) {
    let attempts = 0;

    while (
      queues[queueIndex].remaining <= 0 &&
      attempts < queues.length
    ) {
      queueIndex =
        (queueIndex + 1) % queues.length;

      attempts++;
    }

    if (attempts >= queues.length) {
      break;
    }

    const current = queues[queueIndex];

    const duration = Math.min(
      WINDOW_SECONDS,
      current.remaining,
      Math.floor(
        (dayEnd.getTime() - cursor.getTime()) / 1000
      )
    );

    if (duration <= 0) {
      break;
    }

    const startAt = new Date(cursor);

    const endAt = new Date(
      cursor.getTime() + duration * 1000
    );

    slots.push({
      orderId: current.order.id,
      adSpaceId: current.order.adSpaceId,
      startAt,
      endAt,
      durationSeconds: duration,
      status: "SCHEDULED",
    });

    current.remaining -= duration;

    cursor = endAt;

    queueIndex =
      (queueIndex + 1) % queues.length;
  }

  if (slots.length === 0) {
    return [];
  }

  await tx.scheduledSlot.createMany({
    data: slots,
  });

  return tx.scheduledSlot.findMany({
    where: {
      orderId,
    },
    orderBy: {
      startAt: "asc",
    },
  });
};

module.exports = {
  generateSchedule,
};