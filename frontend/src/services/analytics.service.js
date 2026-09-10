import api from "./api";

export const getAdvertiserAnalytics = async () => {
    const response = await api.get("/analytics/advertiser");
    return response.data;
};

export const getAdvertiserDashboard = async () => {
    const response = await api.get("/analytics/advertiser/dashboard");
    return response.data;
};

export const getAdminAnalytics = async () => {
    const response = await api.get("/analytics/admin");
    return response.data;
};