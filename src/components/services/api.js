import axios from 'axios';
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_URL}/v1/auth/refresh/`, 
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access;

        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;