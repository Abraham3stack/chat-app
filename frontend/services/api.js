import axios from "axios";

const normalizeUrl = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
};

const normalizeApiBase = (value) => {
  const normalized = normalizeUrl(value);

  if (!normalized) {
    return "http://localhost:5001/api";
  }

  if (/\/api(?:\/.*)?$/i.test(normalized)) {
    return normalized.replace(/\/api(?:\/.*)?$/i, "/api");
  }

  return `${normalized}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBase(process.env.NEXT_PUBLIC_API_URL)
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("pulse_chat_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
