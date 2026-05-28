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
    dates,
    timeSlots,
    vehicles,
    dateLabel,
    timeLabel,
    canContinue,
    canSubmit,
    showVehicleWarning,
    submitError,
    isSubmitting,
    vehicleModalOpen,
    setVehicleModalOpen,
    goToReviewStep,
    goToDateTimeStep,
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

  const vehicleWarning = showVehicleWarning ? (
    <p className="mt-4 text-[13px] text-amber-600 font-medium flex items-center gap-1.5">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
      Please select or add a vehicle to continue.
    </p>
  ) : null;

  const errorMessage = submitError ? (
    <p className="mt-4 text-[13px] text-red-500 font-medium">{submitError}</p>
  ) : null;

  return (
    <CheckoutShell {...shellProps}>
      <FormProvider {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 2) submitBooking();
          }}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              {step === 1 ? (
                <DateTimeStep
                  dates={dates}
                  timeSlots={timeSlots}
                  vehicles={vehicles}
                  onAddVehicleClick={() => setVehicleModalOpen(true)}
                />
              ) : (
                <ReviewStep
                  providerName={providerName}
                  services={services}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                />
              )}

              <CheckoutWizardFooter
                step={step}
                canContinue={canContinue}
                isSubmitting={isSubmitting}
                canSubmit={canSubmit}
                onBackStep={goToDateTimeStep}
                onContinue={goToReviewStep}
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
