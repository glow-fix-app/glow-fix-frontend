import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spinner } from "@heroui/react";
import { PlusIcon, BanknotesIcon } from "@heroicons/react/24/outline";

import { useProviderDashboard } from "../hooks/useProviderDashboard";
import ProviderDashboardStats from "../components/ProviderDashboardStats";
import ProviderDashboardSchedule from "../components/ProviderDashboardSchedule";
import ProviderDashboardPending from "../components/ProviderDashboardPending";
import ProviderDashboardReviews from "../components/ProviderDashboardReviews";

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const {
    business,
    stats,
    schedule,
    pendingRequests,
    reviews,
    isLoading,
    error,
  } = useProviderDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error Loading Dashboard</h2>
        <p>There was a problem loading your dashboard data. Please try refreshing.</p>
      </div>
    );
  }

  // Format the current date as "Tuesday, April 7, 2026"
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const businessName = business?.business_name || "Provider";
  const todayBookingsCount = stats?.today_bookings || schedule?.length || 0;
  const pendingCount = stats?.pending_requests || pendingRequests?.length || 0;

  return (
    <div className="w-full pb-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          Good morning, {businessName}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <p className="text-sm text-gray-500">
          {currentDate} — {todayBookingsCount} bookings today, {pendingCount} pending approval
        </p>
      </div>

      {/* Stats Section */}
      <ProviderDashboardStats stats={stats} />

      {/* Main Grid: Schedule and Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[300px]">
          <ProviderDashboardSchedule schedule={schedule} />
        </div>
        <div className="min-h-[300px]">
          <ProviderDashboardPending requests={pendingRequests} />
        </div>
      </div>

      {/* Recent Reviews */}
      <ProviderDashboardReviews reviews={reviews} />

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Button
          size="lg"
          variant="flat"
          className="bg-white border border-gray-200 justify-start h-14 font-medium hover:border-blue-200 hover:bg-blue-50 transition-all"
          startContent={<PlusIcon className="w-5 h-5 text-gray-400" />}
          onPress={() => navigate("/provider/services")}
        >
          Add New Service
        </Button>
        <Button
          size="lg"
          variant="flat"
          className="bg-white border border-gray-200 justify-start h-14 font-medium hover:border-green-200 hover:bg-green-50 transition-all"
          startContent={<BanknotesIcon className="w-5 h-5 text-gray-400" />}
          onPress={() => navigate("/provider/payouts")}
        >
          View Payouts
        </Button>
      </div>
    </div>
  );
}
