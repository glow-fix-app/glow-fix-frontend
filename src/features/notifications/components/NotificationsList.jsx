import React, { useState } from "react";
import { Button, ButtonGroup, Chip } from "@heroui/react";
import {
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// Double checkmark SVG for "Mark all read"
const DoubleCheckIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6L7 17l-5-5" />
    <path d="M22 10l-7.5 7.5L13 16" />
  </svg>
);

// Mock data based on schema and screenshot
const STATIC_NOTIFICATIONS = [
  {
    id: "1",
    type: "new_booking_request",
    title: "New Booking Request",
    body: "Mohamed Ali booked a Full Detail Wash for April 8",
    timeAgo: "5 min ago",
    read_at: null,
    icon: CalendarDaysIcon,
  },
  {
    id: "2",
    type: "new_message",
    title: "New Message",
    body: "Sara Ibrahim: 'My engine has been making a strange noise'",
    timeAgo: "15 min ago",
    read_at: null,
    icon: ChatBubbleLeftIcon,
  },
  {
    id: "3",
    type: "payment_received",
    title: "Payment Received",
    body: "EGP 350 received for booking BK-1001",
    timeAgo: "1 hour ago",
    read_at: null,
    icon: CurrencyDollarIcon,
  },
  {
    id: "4",
    type: "new_review",
    title: "New Review",
    body: "Mohamed Ali gave you 5 stars for Full Detail Wash",
    timeAgo: "2 hours ago",
    read_at: "2026-05-17T12:00:00Z",
    icon: StarIcon,
  },
  {
    id: "5",
    type: "booking_confirmed",
    title: "Booking Confirmed",
    body: "Hana Fathi's booking for April 8 has been confirmed",
    timeAgo: "3 hours ago",
    read_at: "2026-05-17T11:00:00Z",
    icon: CalendarDaysIcon,
  },
  {
    id: "6",
    type: "platform_update",
    title: "Platform Update",
    body: "New analytics dashboard features are now available",
    timeAgo: "Yesterday",
    read_at: "2026-05-16T10:00:00Z",
    icon: ExclamationTriangleIcon,
  },
  {
    id: "7",
    type: "payout_processed",
    title: "Payout Processed",
    body: "EGP 2,125 has been transferred to your bank account",
    timeAgo: "Yesterday",
    read_at: "2026-05-16T09:00:00Z",
    icon: CurrencyDollarIcon,
  },
  {
    id: "8",
    type: "booking_cancelled",
    title: "Booking Cancelled",
    body: "Ali Nasser cancelled his Bodywork Repair booking",
    timeAgo: "2 days ago",
    read_at: "2026-05-15T10:00:00Z",
    icon: CalendarDaysIcon,
  },
];

export default function NotificationsList() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(STATIC_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        read_at: n.read_at ? n.read_at : new Date().toISOString(),
      }))
    );
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  };

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <Chip
              color="primary"
              size="sm"
              className="bg-blue-500 font-semibold text-white"
            >
              {unreadCount}
            </Chip>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <ButtonGroup>
            <Button
              className={
                filter === "all"
                  ? "bg-blue-500 font-medium text-white"
                  : "border-1 border-gray-200 bg-white font-medium text-slate-600 hover:bg-gray-50"
              }
              onPress={() => setFilter("all")}
              variant={filter === "all" ? "solid" : "bordered"}
            >
              All
            </Button>
            <Button
              className={
                filter === "unread"
                  ? "bg-blue-500 font-medium text-white"
                  : "border-1 border-l-0 border-gray-200 bg-white font-medium text-slate-600 hover:bg-gray-50"
              }
              onPress={() => setFilter("unread")}
              variant={filter === "unread" ? "solid" : "bordered"}
            >
              Unread
            </Button>
          </ButtonGroup>
          <Button
            variant="light"
            className="font-medium text-slate-600 hover:bg-gray-100 px-3"
            startContent={<DoubleCheckIcon className="h-5 w-5" />}
            onPress={handleMarkAllRead}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.map((notification) => {
          const isUnread = !notification.read_at;
          const Icon = notification.icon;

          return (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                isUnread
                  ? "border-blue-100 bg-surface-page"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isUnread
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  {notification.title}
                </h3>
                <p className="mt-0.5 truncate text-[14px] text-slate-600">
                  {notification.body}
                </p>
                <p className="mt-1.5 text-[12px] text-slate-400">
                  {notification.timeAgo}
                </p>
              </div>
              {isUnread && (
                <div className="flex shrink-0 self-center pr-2">
                  <button
                    aria-label="Mark as read"
                    title="Mark as read"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
