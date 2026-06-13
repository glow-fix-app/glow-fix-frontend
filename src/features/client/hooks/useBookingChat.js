import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/features/chat/services/chatApi";

/**
 * Fetches (or creates) a direct GENERAL conversation with the provider,
 * so the client has a single chat across all their bookings.
 */
export function useBookingChat(bookingId, providerUserId) {
  const query = useQuery({
    queryKey: ["bookingConversation", bookingId, providerUserId],
    queryFn: () => chatApi.directConversation(providerUserId),
    enabled: Boolean(bookingId) && Boolean(providerUserId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const conversation = query.data ?? null;

  return {
    conversationId: conversation?.id ?? null,
    conversationInfo: conversation
      ? {
          name:
            conversation.name ||
            conversation.participants
              ?.filter((p) => p.role !== "CLIENT")
              .map((p) => p.user?.fullName ?? p.fullName ?? p.name)
              .filter(Boolean)
              .join(", ") ||
            "Provider",
        }
      : null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
