import React from "react";
import EmptyState from "@/components/feedback/EmptyState";

export default function AdminNotificationsPage() {
  return (
    <EmptyState
      title="No notifications"
      message="System alerts and audit log notifications will appear here."
    />
  );
}
