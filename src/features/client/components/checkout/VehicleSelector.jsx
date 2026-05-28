import { PlusIcon } from "@heroicons/react/24/outline";

function CarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 002 11.7V16c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export default function VehicleSelector({
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  onAddVehicleClick,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-text-primary">Select Vehicle</p>
        <button
          type="button"
          onClick={onAddVehicleClick}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
          Add Vehicle
        </button>
      </div>

      <div className="max-h-[280px] overflow-y-auto pr-1.5">
        {vehicles.length === 0 ? (
          <button
            type="button"
            onClick={onAddVehicleClick}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-default bg-surface-hover p-6 text-center transition-all hover:border-brand-500/30 hover:bg-brand-500/[0.02]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <CarIcon className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">No vehicles in your garage</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">Add a vehicle to complete your booking</p>
            </div>
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vehicles.map((car) => {
              const isSelected = car.id === selectedVehicleId;
              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => onSelectVehicle(car.id)}
                  className={`relative flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 text-left transition-all duration-200 border-2 ${isSelected
                    ? "border-brand-500 bg-brand-500/[0.02] shadow-sm"
                    : "border-border-default bg-white hover:border-brand-500/30 hover:bg-surface-hover"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isSelected
                        ? "bg-brand-500/10 text-brand-500"
                        : "bg-surface-hover text-text-secondary ring-1 ring-black/5"
                        }`}
                    >
                      <CarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[13.5px] font-semibold text-text-primary">
                        {car.year} {car.model}
                      </span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        {car.color}
                        {car.license_plate ? ` · ${car.license_plate}` : ""}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
