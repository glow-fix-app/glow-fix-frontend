import { BOOKING_STEPS } from "@/features/client/lib/bookingConstants";

export default function BookingProgressStepper({ view }) {
  const { status, stepIndex: currentStepIndex, rejectionReason, cancellationReason } = view;
  const isFailedState = status === "cancelled" || status === "rejected";

  if (isFailedState) {
    const reason = rejectionReason || cancellationReason || "No specific reason provided.";
    return (
      <div className="flex items-start gap-4 py-2">
        <div className="mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-red-100 text-red-600 shadow-sm shadow-red-500/20">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-700 uppercase tracking-wider">{status}</p>
          <p className="text-[13px] mt-1 text-red-900/80 font-medium leading-relaxed">
            {status === "rejected" 
              ? "This booking request was rejected by the provider." 
              : "This booking was cancelled."}
          </p>
          <div className="mt-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-[12px] font-semibold text-red-800/60 uppercase tracking-wider mb-1">Reason</p>
            <p className="text-[14px] text-red-900 font-medium">{reason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start w-full justify-between pb-2 overflow-x-auto">
      {BOOKING_STEPS.map((step, i) => {
        const isCompleted = i <= currentStepIndex;
        const isLast = i === BOOKING_STEPS.length - 1;
        return (
          <div key={step.key} className="relative flex flex-col items-center flex-1 min-w-[75px]">
            {!isLast && (
              <div
                className={`absolute top-[18px] left-1/2 w-full h-0 border-t-2 border-dashed z-0 ${
                  i < currentStepIndex ? "border-brand-500" : "border-gray-300"
                }`}
              />
            )}
            <div
              className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                isCompleted
                  ? "bg-brand-500 text-white shadow-sm shadow-blue-500/20"
                  : "bg-gray-100 text-text-muted"
              }`}
            >
              {isCompleted ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`relative z-10 mt-2 text-[10px] font-semibold text-center leading-tight whitespace-nowrap px-1.5 bg-white ${
                isCompleted ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
