import { api } from "./api";

export const getHealth = async () => {
  const response = await api.get(`/health?t=${Date.now()}`);
  return response.data;
};

export const getHealthLive = async () => {
  const response = await api.get(`/health/live?t=${Date.now()}`);
  return response.data;
};

export const getHealthReady = async () => {
  const response = await api.get(`/health/ready?t=${Date.now()}`);
  return response.data;
};
