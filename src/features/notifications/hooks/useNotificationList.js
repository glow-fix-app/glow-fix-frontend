import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { notificationsApi } from "@/features/notifications/services/notificationsApi";
import { queryKeys } from "@/services/queryClient";

/** REST-only notifications query (no Socket.IO). Safe for navbar and layouts. */
export function useNotificationList(params = {}) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: [...queryKeys.notifications, params],
    queryFn: () => notificationsApi.list({ limit: 50, ...params }),
    enabled: isAuthenticated,
  });
}
