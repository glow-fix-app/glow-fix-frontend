import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi, createChatSocket } from "@/features/chat/services/chatApi";
import { queryKeys } from "@/services/queryClient";

export function useChat() {
  const socket = useMemo(() => createChatSocket(), []);
  const conversations = useQuery({
    queryKey: queryKeys.chat,
    queryFn: chatApi.conversations,
  });

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_SOCKET !== "true") {
      return undefined;
    }

    socket.connect();
    return () => socket.disconnect();
  }, [socket]);

  return { socket, conversations };
}





