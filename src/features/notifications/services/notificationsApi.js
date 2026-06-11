import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const notificationsApi = {
  list: (params) => api.get(endpoints.notifications, { params }).then((res) => res.data),
  unreadCount: () => api.get(`${endpoints.notifications}/unread-count`).then((res) => res.data),
  markRead: (id) => api.patch(`${endpoints.notifications}/${id}/read`).then((res) => res.data),
  markAllRead: () => api.patch(`${endpoints.notifications}/read-all`).then((res) => res.data),
  deleteNotification: (id) => api.delete(`${endpoints.notifications}/${id}`).then((res) => res.data),
};




