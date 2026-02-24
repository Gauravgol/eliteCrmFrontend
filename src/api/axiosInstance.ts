import axios from "axios";
import { generateUrn } from "../utils/generateUrn";
import { toast } from "react-toastify";

// console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  // withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const urn = generateUrn(Number(import.meta.env.VITE_URN_LENGTH || 13));
    config.headers['urn'] = urn;
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      toast.error("Session expired. Please login again.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return Promise.reject("Token expired");
    }

    config.headers["Authorization"] = `Bearer ${token}`;

    console.log(`Request [${config.method?.toUpperCase()}] to ${config.url}`, { urn });

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res?.responseCode == 200) {
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
