import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingCard from "@/features/client/components/bookings/BookingCard";
import EmptyState from "@/components/feedback/EmptyState";
import { Spinner, Tabs, toast } from "@heroui/react";
import PageHeader from "@/components/ui/PageHeader";
import { useBookings } from "@/features/client/hooks/useBookings";
import { clientApi } from "@/features/client/services/clientApi";
import { ROUTE_PATHS } from "@/routes/paths";
import { queryKeys } from "@/services/queryClient";

export default function ClientBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);
  const { bookings, isLoading, error } = useBookings();

  const visible = bookings.filter((b) => b.tab === activeTab);

  const cancelMutation = useMutation({
    mutationFn: clientApi.cancelBooking,
    onSuccess: () => {
      toast.success("Booking cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    onError: () => {
      toast.danger("Failed to cancel booking. Please try again.");
    },
  });

  function handleViewDetails(id) {
    navigate(ROUTE_PATHS.BOOKING_DETAIL(id));
  }

  function handleCancel(id) {
    setCancellingId(id);
    cancelMutation.mutate(id, {
      onSettled: () => setCancellingId(null),
    });
  }

  function handleReviewReport(id) {
    navigate(ROUTE_PATHS.BOOKING_REPORT(id));
  }

  return (
    <section className="mx-auto w-full max-w-7xl pb-16">
      <PageHeader
        pretitle="Bookings"
        title="Your Appointments"
        description="Manage your upcoming, past, and cancelled service appointments."
      />

      <div className="mt-6 mb-4">
        <Tabs
          className="w-full max-w-sm"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key)}
        >
          <Tabs.ListContainer>
            <Tabs.List
              aria-label="Filter bookings"
              className="flex bg-white border border-gray-200 p-1.5 rounded-xl gap-1 w-full"
            >
              <Tabs.Tab
                id="upcoming"
                className={`flex-1 py-2 px-4 text-[14px] font-semibold text-center transition-all cursor-pointer rounded-lg ${
                  activeTab === "upcoming"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                Upcoming
              </Tabs.Tab>
              <Tabs.Tab
                id="past"
                className={`flex-1 py-2 px-4 text-[14px] font-semibold text-center transition-all cursor-pointer rounded-lg ${
                  activeTab === "past"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                Past
              </Tabs.Tab>
              <Tabs.Tab
                id="cancelled"
                className={`flex-1 py-2 px-4 text-[14px] font-semibold text-center transition-all cursor-pointer rounded-lg ${
                  activeTab === "cancelled"
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                Cancelled
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="mt-5 flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-5">
          <EmptyState
            title="Error loading bookings"
            message="There was an issue fetching your appointments. Please try again later."
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title={`No ${activeTab} bookings`}
            message={
              activeTab === "upcoming"
                ? "Your upcoming appointments will appear here."
                : activeTab === "past"
                  ? "Completed bookings will appear here."
                  : "Cancelled bookings will appear here."
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4">
          {visible.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={handleViewDetails}
              onCancel={handleCancel}
              onReviewReport={handleReviewReport}
              isCancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
