import { FormProvider } from "react-hook-form";
import { Spinner } from "@heroui/react";
import CheckoutShell from "@/features/client/components/checkout/CheckoutShell";
import CheckoutEmptyState from "@/features/client/components/checkout/CheckoutEmptyState";
import CheckoutWizardFooter from "@/features/client/components/checkout/CheckoutWizardFooter";
import DateTimeStep from "@/features/client/components/checkout/steps/DateTimeStep";
import ReviewStep from "@/features/client/components/checkout/steps/ReviewStep";
import OrderSummary from "@/features/client/components/checkout/OrderSummary";
import VehicleModal from "@/features/client/components/settings/VehicleModal";
import { useBookingCheckout } from "@/features/client/hooks/useBookingCheckout";
import { ROUTE_PATHS } from "@/routes/paths";

export default function BookingCheckoutPage() {
  const {
    view,
    step,
    form,
    shellProps,
    providerId,
    providerName,
    services,
    operatingHours,
    vehicles,
    dateLabel,
    timeLabel,
    canContinue,
    canSubmit,
    showVehicleWarning,
    timeError,
    submitError,
    isUploading,
    isSubmitting,
    vehicleModalOpen,
    setVehicleModalOpen,
    goToDateTimeStep,
    goToReviewStep,
    submitBooking,
  } = useBookingCheckout();

  if (view === "loading") {
    return (
      <CheckoutShell {...shellProps}>
        <div className="flex justify-center py-24">
          <Spinner size="lg" color="primary" />
        </div>
      </CheckoutShell>
    );
  }

  if (view === "empty") {
    return (
      <CheckoutShell {...shellProps}>
        <CheckoutEmptyState message="No services selected. Choose services from a provider to continue." />
      </CheckoutShell>
    );
  }

  if (view === "invalid") {
    return (
      <CheckoutShell {...shellProps}>
        <CheckoutEmptyState
          message="We could not load your selected services. They may have been removed or the link is invalid."
          actionLabel="Back to provider"
          actionPath={
            providerId ? ROUTE_PATHS.PROVIDER_DETAIL(providerId) : ROUTE_PATHS.SERVICES
          }
        />
      </CheckoutShell>
    );
  }

  const vehicleWarning =
    step === 1 && showVehicleWarning ? (
      <p className="mt-4 text-[13px] text-amber-600 font-medium flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        Please select a vehicle and a date/time to continue.
      </p>
    ) : null;

  const errorMessage = submitError ? (
    <p className="mt-4 text-[13px] text-red-500 font-medium">{submitError}</p>
  ) : null;

  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Review" },
  ];

  return (
    <CheckoutShell {...shellProps}>
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map(({ n, label }, i, arr) => (
              <div key={n} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                      step === n
                        ? "bg-brand-500 text-white"
                        : step > n
                        ? "bg-brand-500/20 text-brand-600"
                        : "bg-gray-100 text-text-muted"
                    }`}
                  >
                    {step > n ? "✓" : n}
                  </span>
                  <span
                    className={`hidden text-[12px] font-medium sm:block ${
                      step === n ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`h-px w-8 transition-colors ${
                      step > n ? "bg-brand-500/40" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              {step === 1 && (
                <DateTimeStep
                  operatingHours={operatingHours}
                  vehicles={vehicles}
                  timeError={timeError}
                  onAddVehicleClick={() => setVehicleModalOpen(true)}
                />
              )}
              {step === 2 && (
                <ReviewStep
                  providerName={providerName}
                  services={services}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                />
              )}

              <CheckoutWizardFooter
                step={step}
                totalSteps={2}
                canContinue={canContinue}
                isSubmitting={isSubmitting}
                isUploading={isUploading}
                canSubmit={canSubmit}
                onBackStep={step === 2 ? goToDateTimeStep : undefined}
                onContinue={step === 1 ? goToReviewStep : undefined}
                onConfirm={step === 2 ? submitBooking : undefined}
                vehicleWarning={vehicleWarning}
                errorMessage={errorMessage}
              />
            </div>

            <OrderSummary services={services} className="sticky top-24 hidden lg:block" />
          </div>

          <OrderSummary services={services} className="mt-8 lg:hidden" />
        </form>
      </FormProvider>

      <VehicleModal isOpen={vehicleModalOpen} onClose={() => setVehicleModalOpen(false)} />
    </CheckoutShell>
  );
}
