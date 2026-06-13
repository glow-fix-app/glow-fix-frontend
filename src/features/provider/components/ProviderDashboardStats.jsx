import React from "react";
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/components/dashboard/StatCard";

export default function ProviderDashboardStats({ stats }) {
  // Use real data from the backend if available, otherwise default to 0
  const todayBookings = stats?.today_bookings ?? 0;
  const thisWeekRevenue = stats?.this_week_revenue ?? stats?.total_revenue ?? 0;
  const pendingRequests = stats?.pending_requests ?? 0;
  const averageRating = stats?.average_rating ?? 0;
  const totalReviews = stats?.total_reviews ?? 0;

  // Formatting revenue
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Today's Bookings"
        value={todayBookings}
        icon={<CalendarDaysIcon className="w-5 h-5" />}
      />
      <StatCard
        title="This Week's Revenue"
        value={formatCurrency(thisWeekRevenue)}
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
      />
      <StatCard
        title="Pending Requests"
        value={pendingRequests}
        icon={<ClockIcon className="w-5 h-5" />}
      />
      <StatCard
        title="Average Rating"
        value={averageRating.toFixed(1)}
        subtext={`${totalReviews} reviews`}
        icon={<StarIcon className="w-5 h-5" />}
      />
    </div>
  );
}
