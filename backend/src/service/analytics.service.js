const prisma = require("../config/prisma.js");

const getAdvertiserAnalytics = async (advertiserId) => {
  const orders = await prisma.order.findMany({
    where: {
      advertiserId,
    },
    select: {
      id: true,
      adId: true,
      adSpaceId: true,
      date: true,
      durationSeconds: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      ad: {
        select: {
          id: true,
          title: true,
        },
      },
      adSpace: {
        select: {
          pageNumber: true,
          position: true,
          size: true,
        },
      },
    },
  });

  const orderIds = orders.map((order) => order.id);

  const events = orderIds.length
    ? await prisma.adEvent.findMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const clicks = events.filter(
    (event) => event.eventType === "CLICK"
  ).length;

  const impressions = events.filter(
    (event) => event.eventType === "IMPRESSION"
  ).length;

  const totalDisplayDuration = events.reduce(
    (total, event) => {
      if (!event.startedAt || !event.endedAt) {
        return total;
      }

      const seconds =
        (new Date(event.endedAt).getTime() -
          new Date(event.startedAt).getTime()) /
        1000;

      return total + Math.max(seconds, 0);
    },
    0
  );

  const intervals = events
    .filter(
      (event) =>
        event.eventType === "IMPRESSION" &&
        event.startedAt &&
        event.endedAt
    )
    .map((event) => ({
      eventId: event.id,
      adId: event.adId,
      orderId: event.orderId,
      startAt: event.startedAt,
      endAt: event.endedAt,
      durationSeconds:
        (new Date(event.endedAt).getTime() -
          new Date(event.startedAt).getTime()) /
        1000,
    }));

  return {
    summary: {
      totalOrders: orders.length,
      paidOrders: orders.filter(
        (order) => order.paymentStatus === "PAID"
      ).length,
      totalClicks: clicks,
      totalImpressions: impressions,
      totalDisplayDurationSeconds:
        totalDisplayDuration,
    },

    orders,

    intervals,
  };
};

const getAdminAnalytics = async () => {
  const [
    totalAdSpaces,
    totalAds,
    pendingAds,
    approvedAds,
    totalOrders,
    paidOrders,
    totalClicks,
    totalImpressions,
  ] = await Promise.all([
    prisma.adSpace.count(),

    prisma.ad.count(),

    prisma.ad.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.ad.count({
      where: {
        status: "APPROVED",
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        paymentStatus: "PAID",
      },
    }),

    prisma.adEvent.count({
      where: {
        eventType: "CLICK",
      },
    }),

    prisma.adEvent.count({
      where: {
        eventType: "IMPRESSION",
      },
    }),
  ]);

  const paidOrdersData = await prisma.order.aggregate({
    where: {
      paymentStatus: "PAID",
    },
    _sum: {
      totalPrice: true,
    },
  });

  return {
    summary: {
      totalAdSpaces,
      totalAds,
      pendingAds,
      approvedAds,
      totalOrders,
      paidOrders,
      totalClicks,
      totalImpressions,
      totalRevenue: Number(
        paidOrdersData._sum.totalPrice || 0
      ),
    },
  };
};

const getAdvertiserDashboard = async (advertiserId) => {
  const [
    totalAds,
    pendingAds,
    approvedAds,
    totalOrders,
    paidOrders,
  ] = await Promise.all([
    prisma.ad.count({
      where: {
        advertiserId,
      },
    }),

    prisma.ad.count({
      where: {
        advertiserId,
        status: "PENDING",
      },
    }),

    prisma.ad.count({
      where: {
        advertiserId,
        status: "APPROVED",
      },
    }),

    prisma.order.count({
      where: {
        advertiserId,
      },
    }),

    prisma.order.count({
      where: {
        advertiserId,
        paymentStatus: "PAID",
      },
    }),
  ]);

  const spend = await prisma.order.aggregate({
    where: {
      advertiserId,
      paymentStatus: "PAID",
    },
    _sum: {
      totalPrice: true,
    },
  });

  const clicks = await prisma.adEvent.count({
    where: {
      eventType: "CLICK",
      order: {
        advertiserId,
      },
    },
  });

  return {
    summary: {
      totalAds,
      pendingAds,
      approvedAds,
      totalOrders,
      paidOrders,
      totalClicks: clicks,
      totalSpend: Number(
        spend._sum.totalPrice || 0
      ),
    },
  };
};

module.exports = {
  getAdvertiserAnalytics,
  getAdminAnalytics,
  getAdvertiserDashboard,
};