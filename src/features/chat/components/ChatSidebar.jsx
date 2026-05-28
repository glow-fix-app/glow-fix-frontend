import { Input } from "@heroui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ChatSidebar({ chats, selectedId, onSelect }) {
  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-surface-hover px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
          <MagnifyingGlassIcon className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-surface-hover border-b border-gray-100 last:border-none ${
              selectedId === chat.id ? "bg-surface-hover" : ""
            }`}
          >
            <UserAvatar
              user={{ name: chat.name }}
              className="w-12 h-12 text-[13px] font-semibold shrink-0 rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-semibold text-[14px] text-text-primary truncate">
                  {chat.name}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted shrink-0">
                  {chat.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-text-tertiary truncate pr-2">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-[10px] font-bold text-white shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
