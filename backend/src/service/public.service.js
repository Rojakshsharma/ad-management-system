const prisma = require("../config/prisma.js");

const getActiveAd = async ({
  pageNumber,
  position,
  size,
}) => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const year = startOfDay.getUTCFullYear();

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
    return null;
  }

  const slot = await prisma.scheduledSlot.findFirst({
    where: {
      adSpaceId: adSpace.id,
      startAt: {
        lte: now,
      },
      endAt: {
        gt: now,
      },
      status: "SCHEDULED",
      order: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      order: {
        include: {
          ad: true,
        },
      },
    },
  });

  if (!slot) {
    return null;
  }

  return {
    adSpace: {
      id: adSpace.id,
      pageNumber: adSpace.pageNumber,
      position: adSpace.position,
      size: adSpace.size,
    },

    slot: {
      id: slot.id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationSeconds: slot.durationSeconds,
    },

    ad: {
      id: slot.order.ad.id,
      title: slot.order.ad.title,
      description: slot.order.ad.description,
      imageUrl: slot.order.ad.imageUrl,
      targetUrl: slot.order.ad.targetUrl,
    },
  };
};

module.exports = {
  getActiveAd,
};