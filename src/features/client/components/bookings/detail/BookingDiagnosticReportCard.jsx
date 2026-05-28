import { useNavigate } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { ROUTE_PATHS } from "@/routes/paths";

export default function BookingDiagnosticReportCard({ view }) {
  const navigate = useNavigate();
  if (!view.hasDiagnosticReport) return null;

  const summary =
    view.primaryReport?.summary ||
    `${view.diagnosticReports.length} report(s) ready. Review findings and estimated costs.`;

  return (
    <Card className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-5 shadow-none">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <Card.Title className="text-[15px] font-bold text-text-primary p-0">
            Your diagnostic report is ready
          </Card.Title>
          <Card.Description className="mt-1 text-[13px] text-text-tertiary p-0">
            {summary}
          </Card.Description>
          <Button
            onPress={() => navigate(ROUTE_PATHS.BOOKING_REPORT(view.bookingId))}
            color="primary"
            className="mt-3 text-[13px] font-medium text-white"
            size="sm"
            radius="full"
          >
            Review full report
          </Button>
        </div>
      </div>
    </Card>
  );
}
