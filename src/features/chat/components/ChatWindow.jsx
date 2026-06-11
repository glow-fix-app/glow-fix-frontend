import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  PaperClipIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import MessageBubble from "./MessageBubble";
import { chatApi } from "@/features/chat/services/chatApi";
import { queryKeys } from "@/services/queryClient";

const EMPTY_ARRAY = [];

export default function ChatWindow({
  selectedChatId,
  selectedChatInfo,
  onBack,
  showBack = Boolean(onBack),
  className = "",
  inputDisabled = false,
  inputPlaceholder = "Type a message...",
  emptyTitle = "Your Messages",
  emptyDescription = "Select a conversation to start chatting.",
  statusLabel,
  socket,
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const typingUsers = useSelector((state) => state.chat.typingUsers[selectedChatId] || EMPTY_ARRAY);

  const { data: messagesData, isLoading } = useQuery({
    queryKey: [...queryKeys.chat, "messages", selectedChatId],
    queryFn: () => chatApi.messages(selectedChatId),
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text) => chatApi.sendMessage(selectedChatId, { body: text }),
    onMutate: async (newText) => {
      await queryClient.cancelQueries({ queryKey: [...queryKeys.chat, "messages", selectedChatId] });
      const previousMessages = queryClient.getQueryData([...queryKeys.chat, "messages", selectedChatId]);
      
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId: selectedChatId,
        senderUserId: currentUser.id,
        senderRole: currentUser.role,
        type: "TEXT",
        body: newText,
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          role: currentUser.role,
        }
      };

      queryClient.setQueryData([...queryKeys.chat, "messages", selectedChatId], (old) => {
        if (!old) return { data: [optimisticMessage], meta: {} };
        return {
          ...old,
          data: [...old.data, optimisticMessage],
        };
      });

      return { previousMessages };
    },
    onError: (err, newText, context) => {
      queryClient.setQueryData([...queryKeys.chat, "messages", selectedChatId], context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat, "messages", selectedChatId] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file) => chatApi.uploadFile(selectedChatId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat, "messages", selectedChatId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.data, typingUsers]);

  useEffect(() => {
    if (messagesData?.data && socket?.connected) {
      let hasUnread = false;
      messagesData.data.forEach(msg => {
        if (msg.senderUserId !== currentUser?.id && !msg.readAt) {
          socket.emit("message.read", { messageId: msg.id });
          hasUnread = true;
        }
      });
      
      if (hasUnread && selectedChatId) {
        chatApi.markRead(selectedChatId).then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.chat });
        }).catch(() => {});
      }
    }
  }, [messagesData?.data, socket, currentUser?.id, selectedChatId, queryClient]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || inputDisabled) return;
    
    sendMessageMutation.mutate(text);
    setInputValue("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileMutation.mutate(file);
    e.target.value = null; // Reset the input
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  if (!selectedChatId) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center text-text-muted bg-white h-full ${className}`}
      >
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <PaperAirplaneIcon className="w-8 h-8 text-text-muted" />
        </div>
        <p className="font-semibold text-[15px] text-text-primary">{emptyTitle}</p>
        <p className="text-[13px] text-text-tertiary mt-1">{emptyDescription}</p>
      </div>
    );
  }

  const isTyping = typingUsers.length > 0;

  return (
    <div className={`flex flex-col h-full w-full bg-white ${className}`}>
      <div className="flex items-center gap-3.5 px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-md z-10">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0 md:hidden"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <UserAvatar
          user={{ name: selectedChatInfo?.name }}
          className="w-10 h-10 text-[13px] font-semibold shrink-0 rounded-full ring-2 ring-gray-50"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">
            {selectedChatInfo?.name || "Chat"}
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-0 bg-[#F9FAFB]">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-[13px] font-medium text-gray-500 border border-gray-100">
              Loading messages...
            </div>
          </div>
        ) : messagesData?.data?.length > 0 ? (
          messagesData.data.map((msg) => (
            <MessageBubble key={msg.id} message={msg} currentUserId={currentUser?.id} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 opacity-80">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-[15px] font-semibold text-gray-700">No messages yet</p>
            <p className="text-[13px] text-gray-500 mt-1">Send a message to start the conversation.</p>
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse pt-2">
            <div className="bg-white border border-gray-100 text-gray-500 rounded-[20px] rounded-bl-[6px] px-4 py-2.5 text-[13px] shadow-sm">
              typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 bg-white">
        <div
          className={`flex items-center gap-1.5 bg-[#F3F4F6] rounded-[24px] pl-3 pr-1.5 py-1.5 transition-all duration-200 ${
            inputDisabled
              ? "opacity-60"
              : "focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.4)] focus-within:border-transparent"
          }`}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            disabled={inputDisabled || uploadFileMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 -ml-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            disabled={inputDisabled || sendMessageMutation.isPending || uploadFileMutation.isPending}
            value={inputValue}
            onChange={handleChange}
            placeholder={uploadFileMutation.isPending ? "Uploading file..." : inputPlaceholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[14.5px] px-1 outline-none text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={inputDisabled || !inputValue.trim() || sendMessageMutation.isPending || uploadFileMutation.isPending}
            className="p-2 ml-1 bg-blue-500 hover:bg-blue-600 text-white rounded-[18px] transition-all duration-200 shrink-0 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <PaperAirplaneIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
