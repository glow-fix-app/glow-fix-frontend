import { Card } from "@heroui/react";
import BookingProgressStepper from "@/features/client/components/bookings/detail/BookingProgressStepper";

export default function BookingStatusCard({ stepIndex }) {
  return (
    <Card className="rounded-2xl border border-gray-200 bg-white shadow-none p-6">
      <Card.Header className="p-0 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</p>
      </Card.Header>
      <Card.Content className="p-0">
        <BookingProgressStepper currentStepIndex={stepIndex} />
      </Card.Content>
    </Card>
  );
}
