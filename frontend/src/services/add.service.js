import api from "./api";

export const getAdminAds = async (params) => {
  const response = await api.get("/admin/ads", {
    params,
  });

  return response.data;
};

export const updateAdStatus = async (id, status) => {
  const response = await api.put(`/admin/ads/${id}/status`, {
    status,
  });

  return response.data;
};

export const createAd = async (formData) => {
  const response = await api.post("/ads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyAds = async (params = {}) => {
  const response = await api.get("/ads/my", {
    params,
  });

  return response.data;
};

export const updateAd = async (id, formData) => {
  const response = await api.put(`/ads/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};