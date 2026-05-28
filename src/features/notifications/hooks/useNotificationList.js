import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { notificationsApi } from "@/features/notifications/services/notificationsApi";
import { queryKeys } from "@/services/queryClient";

/** REST-only notifications query (no Socket.IO). Safe for navbar and layouts. */
export function useNotificationList() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsApi.list,
    enabled: false, // Disabled until backend is implemented to avoid 404 errors
  });
}
