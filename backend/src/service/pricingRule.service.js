const prisma = require("../config/prisma");

const getPricingRules = async (adSpaceId) => {
  return prisma.pricingRule.findMany({
    where: {
      adSpaceId,
    },
    orderBy: [
      { priority: "desc" },
      { startDate: "asc" },
    ],
  });
};

const createPricingRule = async (data) => {
  const adSpace = await prisma.adSpace.findUnique({
    where: {
      id: data.adSpaceId,
    },
  });

  if (!adSpace) {
    const error = new Error("Ad space not found");
    error.statusCode = 404;
    throw error;
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear !== adSpace.year || endYear !== adSpace.year) {
    const error = new Error(
      `Pricing rule dates must belong to year ${adSpace.year}`
    );
    error.statusCode = 400;
    throw error;
  }

  const overlappingRule = await prisma.pricingRule.findFirst({
    where: {
      adSpaceId: data.adSpaceId,
      priority: data.priority,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  if (overlappingRule) {
    const error = new Error(
      "A pricing rule with the same priority already overlaps these dates"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.pricingRule.create({
    data,
  });
};

const updatePricingRule = async (id, data) => {
  const existingRule = await prisma.pricingRule.findUnique({
    where: { id },
  });

  if (!existingRule) {
    const error = new Error("Pricing rule not found");
    error.statusCode = 404;
    throw error;
  }

  const adSpace = await prisma.adSpace.findUnique({
    where: {
      id: data.adSpaceId,
    },
  });

  if (!adSpace) {
    const error = new Error("Ad space not found");
    error.statusCode = 404;
    throw error;
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear !== adSpace.year || endYear !== adSpace.year) {
    const error = new Error(
      `Pricing rule dates must belong to year ${adSpace.year}`
    );
    error.statusCode = 400;
    throw error;
  }

  const overlappingRule = await prisma.pricingRule.findFirst({
    where: {
      id: {
        not: id,
      },
      adSpaceId: data.adSpaceId,
      priority: data.priority,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  if (overlappingRule) {
    const error = new Error(
      "A pricing rule with the same priority already overlaps these dates"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.pricingRule.update({
    where: { id },
    data,
  });
};

module.exports = {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
};