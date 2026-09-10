import api from "./api";

export const getAdSpaces = async () => {
  const response = await api.get("/admin/ad-spaces");

  return response.data.data;
};

export const createAdSpace = async (data) => {
  const response = await api.post("/admin/ad-spaces", data);

  return response.data.data;
};

export const updateAdSpace = async (id, data) => {
  const response = await api.put(`/admin/ad-spaces/${id}`, data);

  return response.data.data;
};