import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@heroui/react";
import EmptyState from "@/components/feedback/EmptyState";
import ChatWindow from "@/features/chat/components/ChatWindow";
import { useBookingDetail } from "@/features/client/hooks/useBookingDetail";
import BookingDetailHeader from "@/features/client/components/bookings/detail/BookingDetailHeader";
import BookingDetailLoading from "@/features/client/components/bookings/detail/BookingDetailLoading";
import BookingDetailsCard from "@/features/client/components/bookings/detail/BookingDetailsCard";
import BookingActionBar from "@/features/client/components/bookings/detail/BookingActionBar";
import BookingStatusCard from "@/features/client/components/bookings/detail/BookingStatusCard";
import BookingDiagnosticReportCard from "@/features/client/components/bookings/detail/BookingDiagnosticReportCard";
import BookingPaymentBanner from "@/features/client/components/bookings/detail/BookingPaymentBanner";

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { view, isLoading, error, cancelMutation } = useBookingDetail(bookingId);

  const bookingChat = useMemo(
    () =>
      view
        ? {
            name: view.providerName ?? "Provider",
            online: false,
            messages: view.chatMessages,
          }
        : null,
    [view]
  );

  if (isLoading) return <BookingDetailLoading />;

  if (error || !view) {
    return (
      <section className="mx-auto w-full max-w-7xl pb-16">
        <EmptyState
          title="Booking not found"
          message="We couldn't find the booking you're looking for."
        />
      </section>
    );
  }

  const handleCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => navigate("/bookings"),
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl pb-16">
      <BookingDetailHeader view={view} onBack={() => navigate("/bookings")} />
      <BookingPaymentBanner view={view} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <BookingStatusCard stepIndex={view.stepIndex} />
          <BookingDetailsCard view={view} />
          <BookingDiagnosticReportCard view={view} />
          <BookingActionBar
            view={view}
            onCancel={handleCancel}
            isCancelling={cancelMutation.isPending}
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-none overflow-hidden flex flex-col h-[560px]">
            <ChatWindow
              selectedChat={bookingChat}
              showBack={false}
              inputDisabled
              inputPlaceholder="Messaging coming soon"
              statusLabel="Booking chat"
              emptyTitle="Booking chat"
              emptyDescription="No messages yet. Chat will appear here when available."
            />
          </Card>
        </div>
      </div>
    </section>
  );
}
