import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { useChat } from "@/features/chat/hooks/useChat";
import { setActiveConversation } from "@/store/slices/chatSlice";
import { chatApi } from "@/features/chat/services/chatApi";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export default function ChatApp() {
  const dispatch = useDispatch();
  const { conversations, socket } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useSelector((state) => state.auth.user);
  const conversationsData = useSelector((state) => state.chat.conversations);
  const selectedId = useSelector((state) => state.chat.activeConversationId);

  const queryClient = useQueryClient();

  // Sync URL -> Redux on load or when URL changes
  useEffect(() => {
    const isSupport = searchParams.get("support") === "true";
    if (isSupport) {
      const initSupport = async () => {
        try {
          const conv = await chatApi.supportConversation();
          queryClient.invalidateQueries({ queryKey: queryKeys.chat });
          setSearchParams({ id: conv.id }, { replace: true });
        } catch (e) {
          console.error("Failed to start support chat:", e);
          setSearchParams({}, { replace: true });
        }
      };
      initSupport();
      return;
    }

    const chatIdFromUrl = searchParams.get("id");
    if (chatIdFromUrl && chatIdFromUrl !== selectedId) {
      dispatch(setActiveConversation(chatIdFromUrl));
    } else if (!chatIdFromUrl && selectedId) {
      dispatch(setActiveConversation(null));
    }
  }, [searchParams, selectedId, dispatch, setSearchParams, queryClient]);

  const handleSelect = (id) => {
    dispatch(setActiveConversation(id));
    if (id) {
      setSearchParams({ id });
      if (socket?.connected) {
        socket.emit("conversation.join", { conversationId: id });
      }
    } else {
      setSearchParams({});
    }
  };

  const handleBack = () => {
    if (selectedId && socket?.connected) {
      socket.emit("conversation.leave", { conversationId: selectedId });
    }
    dispatch(setActiveConversation(null));
    setSearchParams({});
  };

  // Format conversations for the sidebar
  const formattedChats = (conversationsData || []).map((conv) => {
    const otherParticipant = conv.participants?.find((p) => p.userId !== currentUser?.id);
    const name = otherParticipant?.user?.fullName || "Unknown User";
    const avatar_url = otherParticipant?.user?.avatar_url;

    const lastMsg = conv.lastMessage;
    let lastMessagePreview = "No messages yet";
    if (lastMsg) {
      if (lastMsg.deletedAt) {
        lastMessagePreview = "Message deleted";
      } else if (lastMsg.type === "FILE") {
        const isImage = lastMsg.body?.url && lastMsg.body.url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
        lastMessagePreview = isImage ? "📷 Photo" : "📎 File";
      } else if (typeof lastMsg.body === "string") {
        lastMessagePreview = lastMsg.body.length > 50 ? lastMsg.body.slice(0, 50) + "…" : lastMsg.body;
      }
    }

    const me = conv.participants?.find((p) => p.userId === currentUser?.id);
    const hasUnread = lastMsg
      && lastMsg.senderUserId !== currentUser?.id
      && (!me?.lastReadAt || new Date(lastMsg.createdAt) > new Date(me.lastReadAt));

    return {
      id: conv.id,
      name,
      avatar_url,
      lastMessage: lastMessagePreview,
      time: formatTime(conv.updatedAt),
      unread: hasUnread ? 1 : 0,
      original: conv,
    };
  });

  const selectedChatInfo = formattedChats.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Sidebar — full on mobile when no chat selected, fixed width on md+ */}
      <div
        className={`shrink-0 h-full border-r border-border-default bg-white
          ${selectedId ? "hidden md:flex md:w-[300px] lg:w-[340px]" : "flex w-full md:w-[300px] lg:w-[340px]"}
        `}
      >
        <ChatSidebar
          chats={formattedChats}
          selectedId={selectedId}
          onSelect={handleSelect}
          isLoading={conversations.isLoading}
        />
      </div>

      {/* Chat window — hidden on mobile when no chat selected */}
      <div
        className={`flex-1 h-full min-w-0
          ${!selectedId ? "hidden md:flex" : "flex"}
        `}
      >
        <ChatWindow
          selectedChatId={selectedId}
          selectedChatInfo={selectedChatInfo}
          onBack={handleBack}
          socket={socket}
        />
      </div>
    </div>
  );
}
