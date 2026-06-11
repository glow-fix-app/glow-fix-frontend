import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import { useChat } from "@/features/chat/hooks/useChat";
import { setActiveConversation } from "@/store/slices/chatSlice";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const PERSIST_KEY = "chat_active_conversation";

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

  const currentUser = useSelector((state) => state.auth.user);
  const conversationsData = useSelector((state) => state.chat.conversations);
  const selectedId = useSelector((state) => state.chat.activeConversationId);

  // Restore persisted conversation on first load
  useEffect(() => {
    const saved = sessionStorage.getItem(PERSIST_KEY);
    if (saved) {
      dispatch(setActiveConversation(saved));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever the selected conversation changes
  useEffect(() => {
    if (selectedId) {
      sessionStorage.setItem(PERSIST_KEY, selectedId);
    } else {
      sessionStorage.removeItem(PERSIST_KEY);
    }
  }, [selectedId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(setActiveConversation(null));
      sessionStorage.removeItem(PERSIST_KEY);
    };
  }, [dispatch]);

  const handleSelect = (id) => {
    dispatch(setActiveConversation(id));
    if (id && socket?.connected) {
      socket.emit("conversation.join", { conversationId: id });
    }
  };

  const handleBack = () => {
    if (selectedId && socket?.connected) {
      socket.emit("conversation.leave", { conversationId: selectedId });
    }
    dispatch(setActiveConversation(null));
  };

  // Format conversations for the sidebar
  const formattedChats = (conversationsData || []).map((conv) => {
    const otherParticipant = conv.participants?.find((p) => p.userId !== currentUser?.id);
    const name = otherParticipant?.user?.fullName || "Unknown User";

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
