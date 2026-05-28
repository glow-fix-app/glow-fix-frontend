import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const notificationsApi = {
  list: () => api.get(endpoints.notifications).then((res) => res.data),
  markRead: (id) => api.patch(`${endpoints.notifications}/${id}/read`).then((res) => res.data),
};




