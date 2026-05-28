import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const providerApi = {
  services: () => api.get(`${endpoints.provider}/services`).then((res) => res.data),
  bookings: () => api.get(`${endpoints.provider}/bookings`).then((res) => res.data),
  earnings: () => api.get(`${endpoints.provider}/earnings`).then((res) => res.data),
  reviews: () => api.get(`${endpoints.provider}/reviews`).then((res) => res.data),
  tracking: () => api.get(`${endpoints.provider}/tracking`).then((res) => res.data),
};




