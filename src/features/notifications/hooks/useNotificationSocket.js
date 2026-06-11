import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";

export function useNotificationSocket() {
  const token = useSelector((state) => state.auth.accessToken);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect when we have a valid authenticated session
    if (!isAuthenticated || !token) return;

    const socket = io(
      `${import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}/notifications`,
      {
        autoConnect: false,
        transports: ["websocket"],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    socketRef.current = socket;

    const invalidateNotifications = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };

    socket.on("notification.created", invalidateNotifications);
    socket.on("notification.read", invalidateNotifications);
    socket.on("notification.read_all", invalidateNotifications);
    socket.on("notification.deleted", invalidateNotifications);

    socket.on("connect_error", (err) => {
      console.warn("[NotificationSocket] Connection error:", err.message);
    });

    // Connect after all listeners are attached to avoid missing early events
    socket.connect();

    return () => {
      socket.off("notification.created", invalidateNotifications);
      socket.off("notification.read", invalidateNotifications);
      socket.off("notification.read_all", invalidateNotifications);
      socket.off("notification.deleted", invalidateNotifications);
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  // Re-run only when the token itself changes (e.g. after token refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated]);

  return { socket: socketRef.current };
}
