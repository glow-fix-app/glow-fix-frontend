import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/features/notifications/services/notificationsApi";
import { queryKeys } from "@/services/queryClient";

export function useNotifications() {
  const notifications = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsApi.list,
  });

  return { notifications };
}





