import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  PaperClipIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  selectedChat,
  onBack,
  showBack = Boolean(onBack),
  className = "",
  inputDisabled = false,
  inputPlaceholder = "Type a message...",
  emptyTitle = "Your Messages",
  emptyDescription = "Select a conversation to start chatting.",
  statusLabel,
}) {
  if (!selectedChat) {
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

  const headerStatus =
    statusLabel ??
    (selectedChat.online ? "Online" : "Offline");

  return (
    <div className={`flex-1 flex flex-col h-full bg-white ${className}`}>
      <div className="flex items-center gap-4 p-4 border-b border-border-default bg-white">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-text-tertiary transition-colors shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <UserAvatar
          user={{ name: selectedChat.name }}
          className="w-10 h-10 text-[12px] font-semibold shrink-0 rounded-xl"
        />
        <div>
          <h3 className="font-semibold text-[15px] text-text-primary leading-tight">
            {selectedChat.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedChat.online ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              {headerStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-h-0">
        {selectedChat.messages?.length > 0 ? (
          selectedChat.messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        ) : (
          <p className="text-center text-[13px] text-text-muted py-8">
            {emptyDescription}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-border-default bg-white">
        <div
          className={`flex items-center gap-2 bg-white border border-border-default rounded-full px-2 py-1.5 shadow-sm transition-all ${
            inputDisabled
              ? "opacity-60"
              : "focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500"
          }`}
        >
          <button
            type="button"
            disabled={inputDisabled}
            className="p-2 text-text-muted hover:text-text-tertiary rounded-full hover:bg-gray-100 transition-colors shrink-0 disabled:pointer-events-none"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            disabled={inputDisabled}
            className="p-2 text-text-muted hover:text-text-tertiary rounded-full hover:bg-gray-100 transition-colors shrink-0 disabled:pointer-events-none"
          >
            <FaceSmileIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            disabled={inputDisabled}
            placeholder={inputPlaceholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] px-2 outline-none text-text-primary placeholder:text-text-muted disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={inputDisabled}
            className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-colors shrink-0 shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
