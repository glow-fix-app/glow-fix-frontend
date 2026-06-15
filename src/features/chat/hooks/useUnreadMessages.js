import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { chatApi, getGlobalChatSocket, clearGlobalChatSocket } from "@/features/chat/services/chatApi";
import { queryKeys } from "@/services/queryClient";
import { setUnreadTotal } from "@/store/slices/chatSlice";

/**
 * Mounted globally in AuthBootstrap so the chat unread badge
 * is always up-to-date regardless of which page the user is on.
 * It also maintains the global WebSocket connection for chat.
 */
export function useUnreadMessages() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const socketRef = useRef(null);

  const { data: conversations } = useQuery({
    queryKey: queryKeys.chat,
    queryFn: chatApi.conversations,
    enabled: !!isAuthenticated,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // 1. Maintain global chat socket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const socket = getGlobalChatSocket();
    if (!socket) return;
    
    socketRef.current = socket;

    const onMessageCreated = () => {
      // Whenever ANY new message is created globally, invalidate conversations
      // to immediately refresh the unread badge and sidebar previews
      queryClient.invalidateQueries({ queryKey: queryKeys.chat });
    };

    const onMessageReadStatus = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat });
    };

    socket.on("message.created", onMessageCreated);
    socket.on("message.readStatus", onMessageReadStatus);

    socket.connect();

    return () => {
      socket.off("message.created", onMessageCreated);
      socket.off("message.readStatus", onMessageReadStatus);
      clearGlobalChatSocket();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, queryClient]);

  // 2. Join conversation rooms globally when conversations load
  useEffect(() => {
    const socket = socketRef.current;
    if (!conversations || !socket) return;

    const joinRooms = () => {
      conversations.forEach((conv) => {
        socket.emit("conversation.join", { conversationId: conv.id });
      });
    };

    if (socket.connected) {
      joinRooms();
    }

    socket.on("connect", joinRooms);
    return () => {
      socket.off("connect", joinRooms);
    };
  }, [conversations]);

  // 3. Compute unread count
  useEffect(() => {
    if (!conversations || !user?.id) return;

    const unread = conversations.filter((conv) => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return false;
      if (lastMsg.senderUserId === user.id) return false;
      const me = conv.participants?.find((p) => p.userId === user.id);
      if (!me) return false;
      if (!me.lastReadAt) return true;
      return new Date(lastMsg.createdAt) > new Date(me.lastReadAt);
    }).length;

    dispatch(setUnreadTotal(unread));
  }, [conversations, user?.id, dispatch]);
}
