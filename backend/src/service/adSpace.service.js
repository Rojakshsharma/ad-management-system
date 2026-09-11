const prisma = require("../config/prisma");

const getAllAdSpaces = async () => {
  return prisma.adSpace.findMany({
    orderBy: [
      { pageNumber: "asc" },
      { position: "asc" },
      { size: "asc" },
    ],
  });
};

const createAdSpace = async (data) => {
  const existingSpace = await prisma.adSpace.findUnique({
    where: {
      pageNumber_position_size_year: {
        pageNumber: Number(data.pageNumber),
        position: data.position,
        size: data.size,
        year: Number(data.year),
      },
    },
  });

  if (existingSpace) {
    const error = new Error(
      "Ad space with the same page number, position, size and year already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.adSpace.create({
    data: {
      ...data,
      pageNumber: Number(data.pageNumber),
      year: Number(data.year),
      basePrice: Number(data.basePrice),
    },
  });
};

const updateAdSpace = async (id, data) => {
  const existingSpace = await prisma.adSpace.findUnique({
    where: { id },
  });

  if (!existingSpace) {
    const error = new Error("Ad space not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.adSpace.update({
    where: { id },
    data,
  });
};

module.exports = {
  getAllAdSpaces,
  createAdSpace,
  updateAdSpace,
};