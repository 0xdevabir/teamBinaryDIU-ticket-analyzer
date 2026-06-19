import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const http = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error.response?.data?.detail ??
      error.message ??
      "Request failed";
    const message = typeof detail === "string" ? detail : JSON.stringify(detail);
    return Promise.reject(new Error(message));
  }
);
