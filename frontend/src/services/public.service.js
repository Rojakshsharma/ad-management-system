import api from "./api";

export const getActiveAd = async ({
  pageNumber,
  position,
  size,
}) => {
  const response = await api.get("/public/ad", {
    params: {
      pageNumber,
      position,
      size,
    },
  });

  return response.data;
};