import React from "react";
import EmptyState from "@/components/feedback/EmptyState";

export default function AdminReviewsPage() {
  return (
    <EmptyState
      title="No reviews loaded"
      message="Customer review management will appear here."
    />
  );
}
