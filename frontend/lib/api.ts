import axios from "axios";

const baseURL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/login"
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        return api(originalRequest);
      } catch (refreshError) {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
