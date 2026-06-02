import { api } from "./api";

export const getHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const getHealthLive = async () => {
  const response = await api.get("/health/live");
  return response.data;
};

export const getHealthReady = async () => {
  const response = await api.get("/health/ready");
  return response.data;
};
