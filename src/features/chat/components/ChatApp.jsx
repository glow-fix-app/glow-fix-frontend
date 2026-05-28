import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const MOCK_CHATS = [
  {
    id: "1",
    name: "Garage 37 Auto Service",
    lastMessage: "Your diagnostic report is ready for...",
    time: "12 MIN",
    unread: 2,
    online: true,
    messages: [
      {
        id: "m1",
        type: "system",
        text: "BOOKING BK-10422 CONFIRMED · MON 14:00",
      },
      {
        id: "m2",
        type: "received",
        text: "Hi Mahmoud — we've received your car. We'll start the inspection shortly.",
        time: "MON 14:12",
      },
      {
        id: "m3",
        type: "sent",
        text: "Thanks! Please keep me posted.",
        time: "MON 14:14",
      },
      {
        id: "m4",
        type: "received",
        text: "Inspection complete. Sending the report now.",
        time: "MON 16:30",
      },
      {
        id: "m5",
        type: "received",
        text: "Your diagnostic report is ready for review.",
        time: "MON 16:32",
      },
    ],
  },
  {
    id: "2",
    name: "Shine & Co. Detailing",
    lastMessage: "See you Saturday at 10:30!",
    time: "2 HR",
    unread: 0,
    online: false,
    messages: [],
  },
  {
    id: "3",
    name: "Drive Clinic",
    lastMessage: "We've sent the estimate — please r...",
    time: "YESTERDAY",
    unread: 1,
    online: true,
    messages: [],
  },
];

export default function ChatApp() {
  const [selectedId, setSelectedId] = useState(null);
  const selectedChat = MOCK_CHATS.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Sidebar container */}
      <div
        className={`w-full md:w-[340px] shrink-0 h-full border-r border-border-default ${
          selectedId ? "hidden md:block" : "block"
        }`}
      >
        <ChatSidebar
          chats={MOCK_CHATS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Chat Window container */}
      <div
        className={`flex-1 h-full ${
          !selectedId ? "hidden md:block" : "block"
        }`}
      >
        <ChatWindow
          selectedChat={selectedChat}
          onBack={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
