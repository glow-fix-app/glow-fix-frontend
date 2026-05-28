import { BOOKING_STEPS } from "@/features/client/lib/bookingConstants";

export default function BookingProgressStepper({ currentStepIndex }) {
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
