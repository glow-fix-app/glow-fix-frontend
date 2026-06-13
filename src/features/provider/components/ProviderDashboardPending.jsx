import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@heroui/react";
import EmptyState from "@/components/feedback/EmptyState";

export default function ProviderDashboardPending({ requests = [] }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className="border border-gray-100 bg-white shadow-sm rounded-xl h-full max-h-[450px] flex flex-col">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Pending Booking Requests</h3>
        {requests.length > 0 && (
          <span className="text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2.5 py-0.5">
            {requests.length}
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-grow">
        {requests.length === 0 ? (
          <div className="py-8">
            <EmptyState title="No pending requests" message="You're all caught up!" />
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 p-3 space-y-1.5">
            {requests.map((request) => {
              const clientName =
                request.client_name ||
                request.clientName ||
                request.vehicle?.client?.user?.fullName ||
                "Unknown Customer";

              const scheduledAt = request.scheduled_at || request.scheduledAt;

              return (
                <li
                  key={request.id}
                  className="px-3.5 py-3 border border-gray-100 rounded-xl flex items-center justify-between gap-3 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{clientName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(scheduledAt)}</p>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    className="font-semibold text-xs h-8 px-3 rounded-lg shrink-0"
                    onPress={() => navigate(`/provider/bookings/${request.id}`)}
                  >
                    View
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
