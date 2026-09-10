const prisma = require("../config/prisma.js");
const { generateSchedule } = require("./scheduler.service.js");

const ALLOWED_DURATIONS = [15, 30, 3600, 7200];

const createOrder = async (advertiserId, data) => {
  const {
    adId,
    adSpaceId,
    date,
    durationSeconds,
  } = data;

  if (!ALLOWED_DURATIONS.includes(Number(durationSeconds))) {
    const error = new Error(
      "Duration must be 15 seconds, 30 seconds, 1 hour or 2 hours"
    );
    error.statusCode = 400;
    throw error;
  }

  const duration = Number(durationSeconds);

  const requestedDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(requestedDate.getTime())) {
    const error = new Error("Invalid date");
    error.statusCode = 400;
    throw error;
  }

  const year = requestedDate.getUTCFullYear();

  return prisma.$transaction(
    async (tx) => {
      const ad = await tx.ad.findUnique({
        where: {
          id: adId,
        },
      });

      if (!ad) {
        const error = new Error("Ad not found");
        error.statusCode = 404;
        throw error;
      }

      if (ad.advertiserId !== advertiserId) {
        const error = new Error(
          "You can only purchase placement for your own ad"
        );
        error.statusCode = 403;
        throw error;
      }

      if (ad.status !== "APPROVED") {
        const error = new Error(
          "Only approved ads can be purchased"
        );
        error.statusCode = 400;
        throw error;
      }

      const adSpace = await tx.adSpace.findUnique({
        where: {
          id: adSpaceId,
        },
      });

      if (!adSpace) {
        const error = new Error("Ad space not found");
        error.statusCode = 404;
        throw error;
      }

      if (adSpace.year !== year) {
        const error = new Error(
          "Ad space is not available for the selected year"
        );
        error.statusCode = 400;
        throw error;
      }

      const pricingRules = await tx.pricingRule.findMany({
        where: {
          adSpaceId,
          startDate: {
            lte: requestedDate,
          },
          endDate: {
            gte: requestedDate,
          },
        },
        orderBy: {
          priority: "desc",
        },
      });

      const activeRule = pricingRules[0] || null;

      const pricePerHour = activeRule
        ? Number(activeRule.price)
        : Number(adSpace.basePrice);

      const inventory = await tx.spaceDailyInventory.upsert({
        where: {
          adSpaceId_date: {
            adSpaceId,
            date: requestedDate,
          },
        },
        create: {
          adSpaceId,
          date: requestedDate,
          totalSeconds: 86400,
          bookedSeconds: 0,
        },
        update: {},
      });

      const lockedRows = await tx.$queryRaw`
        SELECT *
        FROM "space_daily_inventory"
        WHERE "id" = ${inventory.id}
        FOR UPDATE
      `;

      const lockedInventory = lockedRows[0];

      if (!lockedInventory) {
        const error = new Error(
          "Daily inventory could not be locked"
        );
        error.statusCode = 500;
        throw error;
      }

      const remainingSeconds =
        Number(lockedInventory.total_seconds) -
        Number(lockedInventory.booked_seconds);

      if (remainingSeconds < duration) {
        const error = new Error(
          `Not enough availability. Only ${remainingSeconds} seconds remain`
        );
        error.statusCode = 409;
        throw error;
      }

      const totalPrice =
        (pricePerHour * duration) / 3600;

      const order = await tx.order.create({
        data: {
          advertiserId,
          adId,
          adSpaceId,
          date: requestedDate,
          durationSeconds: duration,
          pricePerHour,
          totalPrice,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      await tx.spaceDailyInventory.update({
        where: {
          id: lockedInventory.id,
        },
        data: {
          bookedSeconds: {
            increment: duration,
          },
        },
      });

      await generateSchedule(order.id, tx);

      return order;
    },
    {
      isolationLevel: "Serializable",
    }
  );
};

const getMyOrders = async (
  advertiserId,
  { page = 1, limit = 10 }
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: {
        advertiserId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        adSpace: {
          select: {
            id: true,
            pageNumber: true,
            position: true,
            size: true,
          },
        },
      },
    }),

    prisma.order.count({
      where: {
        advertiserId,
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (
  advertiserId,
  orderId
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      advertiserId,
    },
    include: {
      ad: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          targetUrl: true,
          status: true,
        },
      },
      adSpace: {
        select: {
          id: true,
          pageNumber: true,
          position: true,
          size: true,
          year: true,
        },
      },
      scheduledSlots: {
        orderBy: {
          startAt: "asc",
        },
      },
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};