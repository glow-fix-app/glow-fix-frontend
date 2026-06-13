import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@heroui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/feedback/EmptyState";

export default function ProviderDashboardSchedule({ schedule = [] }) {
  const navigate = useNavigate();

  // Format time (e.g. 09:00)
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className="border border-gray-100 bg-white shadow-sm rounded-xl h-full flex flex-col">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
        <Link
          to="/provider/calendar"
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          View Calendar
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </Link>
      </div>
      <div className="p-0 overflow-y-auto flex-grow">
        {schedule.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No bookings today"
              message="You have a clear schedule for the rest of the day."
            />
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {schedule.map((booking) => (
              <li 
                key={booking.id} 
                onClick={() => navigate(`/provider/bookings/${booking.id}`)}
                className="py-3 px-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="text-sm font-medium text-gray-400 w-12 shrink-0 pt-0.5">
                    {formatTime(booking.scheduled_at || booking.scheduledAt)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {booking.client_name || booking.clientName || "Walk-In"}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px]">
                      {booking.items?.[0]?.serviceTitle || "Service"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-4">
                  <StatusBadge status={booking.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
