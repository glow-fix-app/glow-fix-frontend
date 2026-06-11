import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { chatApi, getGlobalChatSocket } from "@/features/chat/services/chatApi";
import { queryKeys } from "@/services/queryClient";
import { setTyping, setConversations, setUnreadTotal } from "@/store/slices/chatSlice";

export function useChat() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const activeConversationId = useSelector((state) => state.chat.activeConversationId);

  const socket = useMemo(() => getGlobalChatSocket(), []);

  const conversations = useQuery({
    queryKey: queryKeys.chat,
    queryFn: chatApi.conversations,
  });

  useEffect(() => {
    if (conversations.data) {
      dispatch(setConversations(conversations.data));

      // Compute unread: conversations where the last message is not from me
      // and was created after my lastReadAt
      const unread = (conversations.data || []).filter((conv) => {
        const lastMsg = conv.lastMessage;
        if (!lastMsg) return false;
        if (lastMsg.senderUserId === user?.id) return false;
        // Find my participant entry to get lastReadAt
        const me = conv.participants?.find((p) => p.userId === user?.id);
        if (!me) return false;
        if (!me.lastReadAt) return true; // never read
        return new Date(lastMsg.createdAt) > new Date(me.lastReadAt);
      }).length;

      dispatch(setUnreadTotal(unread));
    }
  }, [conversations.data, dispatch, user?.id]);


  // Event listeners
  useEffect(() => {
    if (!socket) return;

    const onMessageCreated = (message) => {
      // Update the specific conversation's messages cache
      queryClient.setQueryData(
        [...queryKeys.chat, "messages", message.conversationId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [...oldData.data, message],
          };
        }
      );

      if (user && message.senderUserId !== user.id) {
        socket.emit("message.delivered", { messageId: message.id });
        if (activeConversationId === message.conversationId) {
          socket.emit("message.read", { messageId: message.id });
        }
      }
    };

    const onMessageDelivered = () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat, "messages"] });
    };

    const onMessageReadStatus = () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat, "messages"] });
    };

    const onTypingStart = ({ userId }) => {
      if (activeConversationId) {
        dispatch(setTyping({ conversationId: activeConversationId, userId, isTyping: true }));
      }
    };

    const onTypingStop = ({ userId }) => {
      if (activeConversationId) {
        dispatch(setTyping({ conversationId: activeConversationId, userId, isTyping: false }));
      }
    };

    socket.on("message.created", onMessageCreated);
    socket.on("message.delivered", onMessageDelivered);
    socket.on("message.readStatus", onMessageReadStatus);
    socket.on("typing.start", onTypingStart);
    socket.on("typing.stop", onTypingStop);

    return () => {
      socket.off("message.created", onMessageCreated);
      socket.off("message.delivered", onMessageDelivered);
      socket.off("message.readStatus", onMessageReadStatus);
      socket.off("typing.start", onTypingStart);
      socket.off("typing.stop", onTypingStop);
    };
  }, [socket, queryClient, dispatch, activeConversationId, user]);

  return { socket, conversations };
}
