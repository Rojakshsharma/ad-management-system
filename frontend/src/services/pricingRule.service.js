import api from "./api";

export const getPricingRules = async (adSpaceId) => {
  const response = await api.get("/admin/pricing-rules", {
    params: { adSpaceId },
  });

  return response.data.data;
};

export const createPricingRule = async (data) => {
  const response = await api.post("/admin/pricing-rules", data);

  return response.data.data;
};

export const updatePricingRule = async (id, data) => {
  const response = await api.put(`/admin/pricing-rules/${id}`, data);

  return response.data.data;
};