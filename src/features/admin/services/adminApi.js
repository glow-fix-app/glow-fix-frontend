import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const adminApi = {
  clients: (params) => api.get(`${endpoints.admin}/clients`, { params }).then((res) => res.data),
  users: (params) => api.get(`${endpoints.admin}/users`, { params }).then((res) => res.data),
  providers: (params) => api.get(`${endpoints.admin}/providers`, { params }).then((res) => res.data),
  reports: () => api.get(`${endpoints.admin}/reports`).then((res) => res.data),
  analytics: () => api.get(`${endpoints.admin}/analytics`).then((res) => res.data),
};




