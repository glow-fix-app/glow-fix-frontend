import React from "react";
import EmptyState from "@/components/feedback/EmptyState";

export default function AdminPaymentsPage() {
  return (
    <EmptyState
      title="No payments loaded"
      message="Transactions and payout batches will appear here."
    />
  );
}
