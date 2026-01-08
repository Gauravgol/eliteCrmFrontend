import axios from "axios";
import { generateUrn } from "../utils/generateUrn";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.urn = generateUrn();

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res?.responseCode === "200") {
      return res.apiResponseData;
    }
    return Promise.reject(
      res?.responseMessage || "Something went wrong"
    );
  },
  (error) => {
    return Promise.reject(
      error.response?.data?.responseMessage || "API Error"
    );
  }
);

export default axiosInstance;
