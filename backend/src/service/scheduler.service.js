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

  const now = new Date();

  const dayStart = new Date(order.date);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const isToday =
    order.date.toISOString().slice(0, 10) ===
    now.toISOString().slice(0, 10);

  const cursorStart = isToday ? now : dayStart;

  // Get all confirmed + paid orders for this ad space
  const orders = await tx.order.findMany({
    where: {
      adSpaceId: order.adSpaceId,
      date: order.date,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Get existing slots for this ad space
  const existingSlots = await tx.scheduledSlot.findMany({
    where: {
      adSpaceId: order.adSpaceId,
      startAt: {
        lt: cursorStart,
      },
    },
  });

  // Calculate how much time each order has already consumed
  const consumed = {};

  for (const slot of existingSlots) {
    if (!consumed[slot.orderId]) {
      consumed[slot.orderId] = 0;
    }

    consumed[slot.orderId] += slot.durationSeconds;
  }

  // Delete future schedules for this ad space
  await tx.scheduledSlot.deleteMany({
    where: {
      adSpaceId: order.adSpaceId,
      startAt: {
        gte: cursorStart,
      },
      status: "SCHEDULED",
    },
  });

  // Create queues with remaining purchased duration
  const queues = orders
    .map((currentOrder) => ({
      order: currentOrder,
      remaining:
        currentOrder.durationSeconds -
        (consumed[currentOrder.id] || 0),
    }))
    .filter((item) => item.remaining > 0);

  if (queues.length === 0) {
    return [];
  }

  const slots = [];

  let cursor = cursorStart;
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

    const remainingDaySeconds = Math.floor(
      (dayEnd.getTime() - cursor.getTime()) / 1000
    );

    const duration = Math.min(
      WINDOW_SECONDS,
      current.remaining,
      remainingDaySeconds
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
      adSpaceId: order.adSpaceId,
      startAt: {
        gte: cursorStart,
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });
};

module.exports = {
  generateSchedule,
};