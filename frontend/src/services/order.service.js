import api from "./api";

export const createOrder = async ({
  adId,
  adSpaceId,
  date,
  durationSeconds,
}) => {
  const response = await api.post("/orders", {
    adId,
    adSpaceId,
    date,
    durationSeconds,
  });

  return response.data;
};

export const payOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/pay`);
  return response.data;
};

export const getMyOrders = async ({ page = 1, limit = 50 } = {}) => {
  const response = await api.get("/orders", {
    params: { page, limit },
  });

  return response.data;
};