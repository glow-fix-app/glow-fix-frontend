import React, { useState } from "react";
import { Button, ButtonGroup, Chip, Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import { useNotificationList } from "@/features/notifications/hooks/useNotificationList";
import { notificationsApi } from "@/features/notifications/services/notificationsApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";

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

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return formatter.format(-diffInMinutes, "minute");
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return formatter.format(-diffInHours, "hour");
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return formatter.format(-diffInDays, "day");
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return formatter.format(-diffInMonths, "month");
  
  return formatter.format(-Math.floor(diffInMonths / 12), "year");
}

function getNotificationIcon(typeCode) {
  switch (typeCode) {
    case "BOOKING_CONFIRMED":
    case "BOOKING_CANCELLED":
    case "NEW_BOOKING_REQUEST":
      return CalendarDaysIcon;
    case "NEW_MESSAGE":
      return ChatBubbleLeftIcon;
    case "PAYMENT_RECEIVED":
    case "PAYOUT_PROCESSED":
      return CurrencyDollarIcon;
    case "NEW_REVIEW":
      return StarIcon;
    case "PLATFORM_UPDATE":
      return ExclamationTriangleIcon;
    default:
      return BellIcon;
  }
}

export default function NotificationsList() {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  
  // Socket is managed at the DashboardLayout level — no hook needed here
  const queryClient = useQueryClient();

  // Query notifications based on filter
  const { data, isLoading } = useNotificationList(
    filter === "unread" ? { unreadOnly: true } : {}
  );
  
  const notifications = data?.data || [];
  // Using the total count from the current view or computing unread if we have all
  const unreadCount = filter === "unread" ? data?.meta?.total : notifications.filter(n => !n.readAt).length;

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  const handleMarkAsRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      let url = notification.actionUrl;
      if (url.startsWith('/client/')) {
        url = url.replace('/client/', '/');
      } else if (url.startsWith('/manager/')) {
        url = url.replace('/manager/', '/provider/');
      } else if (url.startsWith('/business/dashboard/')) {
        url = url.replace('/business/dashboard/', '/provider/');
      }
      navigate(url);
    }
  };

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          {(unreadCount > 0) && (
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
            isLoading={markAllReadMutation.isPending}
            isDisabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
           <div className="py-10 flex justify-center items-center">
             <Spinner size="lg" />
           </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No notifications found.
          </div>
        ) : (
          notifications.map((notification) => {
            const isUnread = !notification.readAt;
            const Icon = getNotificationIcon(notification.type?.code);

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  notification.actionUrl ? "cursor-pointer hover:bg-gray-50" : ""
                } ${
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
                  <p className="mt-0.5 text-[14px] text-slate-600">
                    {notification.body}
                  </p>
                  <p className="mt-1.5 text-[12px] text-slate-400">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                
                <div className="flex shrink-0 self-center pr-2 gap-2">
                  {isUnread && (
                    <button
                      aria-label="Mark as read"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      disabled={markReadMutation.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    aria-label="Delete notification"
                    title="Delete notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
