import api from "./api";

export const recordImpression = async ({
  adId,
  orderId,
  adSpaceId,
  startedAt,
  endedAt,
}) => {
  const response = await api.post("/public/events/impression", {
    adId,
    orderId,
    adSpaceId,
    startedAt,
    endedAt,
  });

  return response.data;
};

export const recordClick = async ({
  adId,
  orderId,
  adSpaceId,
}) => {
  const response = await api.post("/public/events/click", {
    adId,
    orderId,
    adSpaceId,
  });

  return response.data;
};