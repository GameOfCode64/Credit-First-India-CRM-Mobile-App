import axios from "axios";

export const api = axios.create({
  baseURL: "https://pro-crm-backend.onrender.com/api/crm",
});

api.interceptors.request.use((config) => {
  const token = config.headers?.Authorization;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
