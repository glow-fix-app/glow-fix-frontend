import { useQuery } from "@tanstack/react-query";
import { providerApi } from "../services/providerApi";

export function useProviderDashboard() {
  // Fetch business details
  const businessQuery = useQuery({
    queryKey: ["provider", "myBusiness"],
    queryFn: providerApi.myBusiness,
  });

  const businessId = businessQuery.data?.id;

  // Fetch stats
  const statsQuery = useQuery({
    queryKey: ["provider", "stats"],
    queryFn: providerApi.stats,
  });

  // Fetch today's schedule
  const today = new Date().toISOString().split("T")[0];
  const scheduleQuery = useQuery({
    queryKey: ["provider", "bookings", "schedule", today],
    queryFn: () =>
      providerApi.managerBookings({
        startDate: today,
        endDate: today,
        limit: 10,
        // Assuming we want to see CONFIRMED or IN_PROGRESS or all for today
      }),
  });

  // Fetch pending requests
  const pendingQuery = useQuery({
    queryKey: ["provider", "bookings", "pending"],
    queryFn: () =>
      providerApi.managerBookings({
        status: "PENDING",
        limit: 10,
      }),
  });

  // Fetch recent reviews
  const reviewsQuery = useQuery({
    queryKey: ["provider", "reviews", businessId],
    queryFn: () =>
      providerApi.businessReviews(businessId, {
        limit: 3, // Just a few for the dashboard
      }),
    enabled: !!businessId,
  });

  const pendingRequests = pendingQuery.data?.data || [];
  const schedule = scheduleQuery.data?.data || [];

  // Merge real pending/today counts into stats since the backend stats endpoint
  // doesn't compute these two fields.
  const mergedStats = statsQuery.data
    ? {
        ...statsQuery.data,
        pending_requests: pendingRequests.length,
        today_bookings: schedule.length,
      }
    : null;

  return {
    business: businessQuery.data,
    stats: mergedStats,
    schedule,
    pendingRequests,
    reviews: reviewsQuery.data?.data || [],
    isLoading:
      businessQuery.isLoading ||
      statsQuery.isLoading ||
      scheduleQuery.isLoading ||
      pendingQuery.isLoading ||
      (reviewsQuery.isLoading && reviewsQuery.fetchStatus !== "idle"),
    error:
      businessQuery.error ||
      statsQuery.error ||
      scheduleQuery.error ||
      pendingQuery.error ||
      reviewsQuery.error,
  };
}
