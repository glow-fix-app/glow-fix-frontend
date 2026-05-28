export default function MessageBubble({ message }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="bg-gray-100 text-text-tertiary text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  const isSent = message.type === "sent";

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isSent
            ? "bg-brand-500 text-white rounded-br-sm shadow-sm shadow-blue-500/20"
            : "bg-white border border-border-default text-text-primary rounded-bl-sm shadow-sm"
        }`}
      >
        <p className="text-[14px] leading-relaxed">{message.text}</p>
        <p
          className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${
            isSent ? "text-blue-100" : "text-text-muted"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}
