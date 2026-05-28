import { useFormContext } from "react-hook-form";
import { DAY_ABBR } from "@/store/slices/checkoutSlice";
import VehicleSelector from "@/features/client/components/checkout/VehicleSelector";

export default function DateTimeStep({
  dates = [],
  timeSlots = [],
  vehicles = [],
  onAddVehicleClick,
}) {
  const { watch, setValue } = useFormContext();
  const selectedDate = watch("selectedDate");
  const selectedTime = watch("selectedTime");
  const selectedVehicleId = watch("selectedVehicleId");

  return (
    <div className="space-y-10">
      <VehicleSelector
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={(id) => setValue("selectedVehicleId", id, { shouldValidate: true })}
        onAddVehicleClick={onAddVehicleClick}
      />

      <div>
        <p className="text-[15px] font-semibold text-text-primary">Choose a date</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {dates.map((date) => {
            const isActive = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setValue("selectedDate", date, { shouldValidate: true })}
                className={`flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "border-border-default bg-white text-text-primary hover:border-brand-500/40"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isActive ? "text-white/80" : "text-text-muted"
                  }`}
                >
                  {DAY_ABBR[date.getDay()]}
                </span>
                <span className="mt-0.5 text-[20px] font-semibold leading-tight">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[15px] font-semibold text-text-primary">Time slots</p>
        {timeSlots.length === 0 ? (
          <p className="mt-3 text-[13px] text-text-tertiary">No available time slots for this date.</p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            {timeSlots.map((time) => {
              const isActive = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setValue("selectedTime", time, { shouldValidate: true })}
                  className={`flex h-[44px] w-[100px] items-center justify-center rounded-full border text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : "border-border-default bg-white text-text-primary hover:border-brand-500/40"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
