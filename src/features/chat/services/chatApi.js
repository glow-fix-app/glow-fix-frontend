import { io } from "socket.io-client";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { store } from "@/store/store";

export const chatApi = {
  conversations: () => api.get(`${endpoints.chat}/conversations`).then((res) => res.data),
  messages: (conversationId) => api.get(`${endpoints.chat}/conversations/${conversationId}/messages`).then((res) => res.data),
  sendMessage: (conversationId, payload) => api.post(`${endpoints.chat}/conversations/${conversationId}/messages`, payload).then((res) => res.data),
  uploadFile: (conversationId, file, caption) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    return api.post(`${endpoints.chat}/conversations/${conversationId}/messages/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data);
  },
  markRead: (conversationId) => api.patch(`${endpoints.chat}/conversations/${conversationId}/read`).then((res) => res.data),
  /** Create-or-fetch a BOOKING conversation for a specific booking. */
  bookingConversation: (bookingId) =>
    api.post(`${endpoints.chat}/conversations`, { type: "BOOKING", bookingId }).then((res) => res.data),
  /** Create-or-fetch a DIRECT conversation with a specific user. */
  directConversation: (targetUserId) =>
    api.post(`${endpoints.chat}/conversations`, { type: "GENERAL", targetUserId }).then((res) => res.data),
};

let globalChatSocket = null;

export function getGlobalChatSocket() {
  if (!globalChatSocket) {
    const token = store.getState().auth.accessToken;
    if (!token) return null;
    
    const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    globalChatSocket = io(`${baseUrl}/chat`, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return globalChatSocket;
}

export function clearGlobalChatSocket() {
  if (globalChatSocket) {
    globalChatSocket.disconnect();
    globalChatSocket = null;
  }
}




