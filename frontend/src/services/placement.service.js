import api from "./api";

export const getAvailability = async ({
  pageNumber,
  position,
  size,
  date,
}) => {
  const response = await api.get("/placements/availability", {
    params: {
      pageNumber,
      position,
      size,
      date,
    },
  });

  return response.data;
};
