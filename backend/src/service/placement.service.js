const prisma = require("../config/prisma.js");

const getAvailability = async ({
  pageNumber,
  position,
  size,
  date,
}) => {
  const requestedDate = new Date(`${date}T00:00:00.000Z`);
  const nextDate = new Date(requestedDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const year = requestedDate.getUTCFullYear();

  // Find the requested ad space
  const adSpace = await prisma.adSpace.findUnique({
    where: {
      pageNumber_position_size_year: {
        pageNumber,
        position,
        size,
        year,
      },
    },
  });

  if (!adSpace) {
    const error = new Error(
      "Ad space not found for the selected page, position, size and year"
    );

    error.statusCode = 404;
    throw error;
  }

  // Find all pricing rules that apply to this date
  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      adSpaceId: adSpace.id,
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

  // Highest priority rule wins
  const activeRule = pricingRules[0] || null;

  const pricePerHour = activeRule
    ? Number(activeRule.price)
    : Number(adSpace.basePrice);

  // Get/create daily inventory
  let inventory = await prisma.spaceDailyInventory.findUnique({
    where: {
      adSpaceId_date: {
        adSpaceId: adSpace.id,
        date: requestedDate,
      },
    },
  });

  if (!inventory) {
    inventory = await prisma.spaceDailyInventory.create({
      data: {
        adSpaceId: adSpace.id,
        date: requestedDate,
        totalSeconds: 86400,
        bookedSeconds: 0,
      },
    });
  }

  // Existing scheduled slots for this space/date
  const scheduledSlots = await prisma.scheduledSlot.findMany({
    where: {
      adSpaceId: adSpace.id,
      startAt: {
        lt: nextDate,
      },
      endAt: {
        gt: requestedDate,
      },
      status: {
        in: ["SCHEDULED", "SERVED"],
      },
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      order: {
        select: {
          id: true,
          advertiserId: true,
          durationSeconds: true,
          status: true,
          paymentStatus: true,
        },
      },
    },
  });

  const remainingSeconds =
    inventory.totalSeconds - inventory.bookedSeconds;

  return {
    adSpace: {
      id: adSpace.id,
      pageNumber: adSpace.pageNumber,
      position: adSpace.position,
      size: adSpace.size,
      year: adSpace.year,
    },

    pricing: {
      basePrice: Number(adSpace.basePrice),
      pricePerHour,
      activeRule: activeRule
        ? {
            id: activeRule.id,
            startDate: activeRule.startDate,
            endDate: activeRule.endDate,
            price: Number(activeRule.price),
            priority: activeRule.priority,
            color: activeRule.color,
            details: activeRule.details,
          }
        : null,
    },

    date,

    capacity: {
      totalSeconds: inventory.totalSeconds,
      bookedSeconds: inventory.bookedSeconds,
      remainingSeconds,
      available: remainingSeconds > 0,
    },

    scheduledSlots,
  };
};

module.exports = {
  getAvailability,
};