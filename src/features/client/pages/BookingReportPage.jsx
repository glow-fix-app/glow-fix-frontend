import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { ROUTE_PATHS } from "@/routes/paths";
import EmptyState from "@/components/feedback/EmptyState";
import FindingCard from "@/features/client/components/reports/FindingCard";
import RepairOptionCard from "@/features/client/components/reports/RepairOptionCard";
import ReportSummaryCard from "@/features/client/components/reports/ReportSummaryCard";
import { formatDateTime, formatEgp } from "@/features/client/utils/formatters";

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════════
export default function BookingReportPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [selectedRepairs, setSelectedRepairs] = useState(new Set());

  // Fetch booking with embedded diagnostic_reports
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery({
    queryKey: [...queryKeys.bookings, bookingId, "report"],
    queryFn: () => clientApi.bookingDetails(bookingId),
    enabled: !!bookingId,
  });

  // Get first report from booking
  const reportId = booking?.diagnostic_report?.id;

  // Fetch full report with findings & repairs
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery({
    queryKey: queryKeys.report(reportId),
    queryFn: () => clientApi.reportDetails(reportId),
    enabled: !!reportId,
    staleTime: 0,
  });

  // ── Derived data ────────────────────────────────────────────────────────────
  const findings = report?.findings || [];
  const repairs = report?.recommended_repairs || [];
  const providerName = booking?.business?.businessName || booking?.branch?.business_name || "Service Provider";
  const providerId = booking?.business?.id || booking?.branch?.id;
  const bookingCode = booking?.id || booking?.booking_code;
  const scheduledLabel = formatDateTime(booking?.scheduled_at);
  const status = (booking?.status || "pending").toLowerCase();
  const hasPaidPayment = booking?.payment?.status === "PAID" || (booking?.payments || []).some(
    (p) => p.status === "PAID"
  );

  // Sort findings by priority
  const priorityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2, OK: 3 };
  const sortedFindings = useMemo(
    () =>
      [...findings].sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 99) -
          (priorityOrder[b.priority] ?? 99)
      ),
    [findings]
  );

  // Toggle repair selection
  const toggleRepair = (repairId) => {
    setSelectedRepairs((prev) => {
      const next = new Set(prev);
      if (next.has(repairId)) next.delete(repairId);
      else next.add(repairId);
      return next;
    });
  };

  // Calculate selected total
  const selectedTotal = useMemo(
    () =>
      repairs
        .filter((r) => selectedRepairs.has(r.id))
        .reduce((sum, r) => sum + (Number(r.price) || 0), 0),
    [repairs, selectedRepairs]
  );

  const selectedDuration = useMemo(
    () =>
      repairs
        .filter((r) => selectedRepairs.has(r.id))
        .reduce((sum, r) => sum + (r.duration_minutes || 0), 0),
    [repairs, selectedRepairs]
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (bookingLoading || reportLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl pb-16">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  // ── Error / no report ───────────────────────────────────────────────────────
  if (bookingError || !booking) {
    return (
      <section className="mx-auto w-full max-w-7xl pb-16">
        <EmptyState
          title="Booking not found"
          message="We couldn't load this booking."
        />
      </section>
    );
  }

  if (!report) {
    return (
      <section className="mx-auto w-full max-w-7xl pb-16">
        <Button
          variant="light"
          onPress={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] text-text-tertiary transition-colors hover:text-text-primary mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to booking
        </Button>
        <EmptyState
          title="No report available"
          message="The provider hasn't submitted a diagnostic report for this booking yet."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl pb-16 pt-8">
      {/* ── Back nav ──────────────────────────────────────────────────────────── */}
      <Button
        variant="light"
        onPress={() => navigate(-1)}
        className="flex items-center gap-2 text-[13px] uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" strokeWidth={1.5} />
        Back to booking
      </Button>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className="mb-12 flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-[16px]">
          {providerName.substring(0, 3).toUpperCase()}
        </div>
        
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-text-tertiary mb-1">
            § Diagnostic Report
          </p>
          <h1 className="text-[26px] text-text-primary leading-tight mb-1.5">
            Diagnostic Report from {providerName}
          </h1>
          <p className="text-[12px] uppercase tracking-wider text-text-muted">
            Submitted {formatDateTime(report.created_at).toUpperCase()} · Valid 72 hours
            {report.estimated_duration && ` · Est. Repair Time: ${report.estimated_duration} hours`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        {/* ═══ Left Column (5/7) — Report Content ════════════════════════════ */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Summary card */}
          <ReportSummaryCard report={report} />

          {/* Findings */}
          {sortedFindings.length > 0 && (
            <div>
              <h2 className="text-[20px] text-text-primary mb-4">
                Findings
              </h2>
              <div className="rounded-[24px] border border-gray-200 overflow-hidden bg-white">
                {sortedFindings.map((f, i) => (
                  <FindingCard 
                    key={f.id} 
                    finding={f} 
                    isLast={i === sortedFindings.length - 1} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended repairs */}
          {repairs.length > 0 && (
            <div>
              <h2 className="text-[20px] text-text-primary mb-4">
                Recommended repairs
              </h2>
              <div className="space-y-3">
                {repairs.map((r) => (
                  <RepairOptionCard
                    key={r.id}
                    repair={r}
                    selected={selectedRepairs.has(r.id)}
                    onToggle={toggleRepair}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Right Column (2/7) — Sticky Action Card ═══════════════════════ */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-[24px] border border-border-default bg-white p-6 shadow-sm">
            {/* Label */}
            <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
              Repair total
            </p>

            {/* Amount */}
            <h3 className="text-[24px] text-text-primary leading-tight mb-1">
              {formatEgp(selectedTotal)}
            </h3>

            {/* Count & Time */}
            <div className="flex items-center justify-between text-[12px] text-text-muted mb-5">
              <span>{selectedRepairs.size} of {repairs.length} repairs selected</span>
              {selectedRepairs.size > 0 && report.estimated_duration && (
                <span className="font-medium text-brand-600">Est. {report.estimated_duration} hours</span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border-default mb-5" />

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                isDisabled={selectedRepairs.size === 0}
                onPress={() => {
                  const selectedItems = repairs.filter((r) => selectedRepairs.has(r.id));
                  const serviceIds = selectedItems
                    .map(item => item.business_service_id)
                    .filter(Boolean);
                    
                  if (providerId) {
                    const params = new URLSearchParams();
                    if (serviceIds.length > 0) {
                      params.set("services", serviceIds.join(","));
                    }
                    navigate(`${ROUTE_PATHS.CHECKOUT(providerId)}?${params.toString()}`);
                  }
                }}
                className="w-full h-[44px] rounded-full text-[12px] flex items-center justify-center transition-all bg-success hover:bg-success/90 text-white disabled:bg-gray-300 disabled:text-text-muted disabled:cursor-not-allowed"
              >
                Accept & book
              </Button>

              <Button
                variant="bordered"
                className="w-full h-[44px] rounded-full border border-border-default bg-white text-[12px] text-text-tertiary flex items-center justify-center hover:bg-gray-50 transition-all"
                onPress={() => window.history.back()}
              >
                Decline & close appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
