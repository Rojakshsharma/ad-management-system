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
  return prisma.adSpace.create({
    data,
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