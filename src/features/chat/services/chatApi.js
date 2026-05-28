import { io } from "socket.io-client";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const chatApi = {
  conversations: () => api.get(`${endpoints.chat}/conversations`).then((res) => res.data),
  messages: (conversationId) => api.get(`${endpoints.chat}/conversations/${conversationId}/messages`).then((res) => res.data),
  sendMessage: (conversationId, payload) => api.post(`${endpoints.chat}/conversations/${conversationId}/messages`, payload).then((res) => res.data),
};

export function createChatSocket() {
  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
    autoConnect: false,
    transports: ["websocket"],
  });
}




