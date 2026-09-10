import api from "./api";
import { storage } from "../utils/storage";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  const { token, user } = response.data.data;

  storage.setAuth(token, user);

  return user;
};

export const logoutUser = () => {
  storage.clearAuth();
};