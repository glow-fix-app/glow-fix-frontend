import axios from "axios";
import { getApiBaseUrl } from "@/services/apiBase";
import { endpoints } from "@/services/endpoints";
import { unwrapApiData } from "@/services/apiResponse";
import { store } from "@/store/store";
import { clearCredentials, setAccessToken } from "@/store/slices/authSlice";

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequest = null;

function getAccessToken() {
  return store.getState().auth.accessToken;
}

function hasExplicitLogout() {
  return localStorage.getItem("isLoggedOut") === "true";
}

function shouldSkipRefresh(url = "") {
  const skipPaths = [
    endpoints.auth.login,
    endpoints.auth.refresh,
    endpoints.auth.logout,
    "/auth/register",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/google",
    "/auth/mfa/validate",
  ];
  return skipPaths.some((path) => url.includes(path));
}

function refreshAccessToken() {
  if (hasExplicitLogout()) {
    return Promise.reject(new Error("Session ended by user logout."));
  }

  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post(endpoints.auth.refresh)
      .then((response) => {
        const data = unwrapApiData(response.data);
        const accessToken = data?.accessToken;

        if (!accessToken) {
          throw new Error("Refresh response did not include an access token.");
        }

        store.dispatch(setAccessToken({ accessToken }));
        return accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrapApiData(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      hasExplicitLogout() ||
      status !== 401 ||
      originalRequest?._retry ||
      shouldSkipRefresh(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      sessionStorage.setItem(
        "authSessionEnded",
        "Your session has ended. Sign in again to continue.",
      );
      store.dispatch(clearCredentials());
      return Promise.reject(refreshError);
    }
  },
);

refreshClient.interceptors.response.use(
  (response) => {
    response.data = unwrapApiData(response.data);
    return response;
  },
  (error) => Promise.reject(error),
);
