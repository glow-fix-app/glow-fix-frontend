import { format } from "date-fns";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";

export default function MessageBubble({ message, currentUserId }) {
  if (message.type === "SYSTEM" || message.senderRole === "SYSTEM") {
    return (
      <div className="flex justify-center">
        <span className="bg-gray-100 text-text-tertiary text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
          {typeof message.body === "string" ? message.body : "System Message"}
        </span>
      </div>
    );
  }

  const isSent = message.senderUserId === currentUserId;
  const time = message.createdAt ? format(new Date(message.createdAt), "HH:mm") : "";

  let content = message.body;
  if (message.type === "FILE" && message.body && typeof message.body === "object") {
    const url = message.body.url;
    const isImage = url && url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
    
    if (isImage) {
      content = (
        <div className="flex flex-col gap-1 -mx-3 -mt-2 -mb-1">
          <a href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-t-[18px] rounded-b-sm">
            <img 
              src={url} 
              alt={message.body.caption || "Image"} 
              className="w-full max-w-[320px] min-w-[200px] h-auto max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </a>
          {message.body.caption && (
            <span className="px-3 pb-1 text-[13px] font-medium opacity-90">{message.body.caption}</span>
          )}
        </div>
      );
    } else {
      content = (
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer" 
          className={`flex items-center gap-3 p-2.5 -mx-2 my-0.5 rounded-xl transition-colors ${
            isSent 
              ? 'bg-blue-600/30 hover:bg-blue-600/50 text-white border border-blue-400/30' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${isSent ? 'bg-blue-500' : 'bg-gray-200 text-gray-600'}`}>
            <DocumentIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-semibold text-[13px] truncate leading-tight">
              {message.body.caption || "Document Attachment"}
            </span>
            <span className={`text-[11px] font-medium mt-0.5 ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
              Click to view
            </span>
          </div>
        </a>
      );
    }
  }

  return (
    <div className={`flex w-full ${isSent ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] md:max-w-[70%] group flex flex-col min-w-0 ${
          isSent ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-[22px] px-4 py-2.5 shadow-sm max-w-full ${
            isSent
              ? "bg-blue-500 text-white rounded-br-[6px]"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-[6px]"
          }`}
        >
          <div className={`text-[14.5px] leading-[1.4] break-words [word-break:break-word] whitespace-pre-wrap ${
            message.type === "FILE" && typeof message.body === "object" && message.body.url && message.body.url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? "pt-0 px-0" : ""
          }`}>
            {content}
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 mt-1 px-1 transition-opacity ${
          isSent ? "justify-end" : "justify-start"
        }`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {time}
          </p>
          {isSent && (
            <div className="flex -space-x-[3px]">
              <CheckIcon className={`w-3.5 h-3.5 ${message.readAt ? 'text-blue-500' : (message.deliveredAt ? 'text-gray-400' : 'text-gray-300')}`} />
              {(message.deliveredAt || message.readAt) && (
                <CheckIcon className={`w-3.5 h-3.5 ${message.readAt ? 'text-blue-500' : 'text-gray-400'}`} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
