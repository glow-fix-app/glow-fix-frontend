import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";

export default function CheckoutWizardFooter({
  step,
  totalSteps = 3,
  canContinue,
  isSubmitting,
  isUploading,
  canSubmit,
  onBackStep,
  onContinue,
  onConfirm,
  vehicleWarning,
  errorMessage,
}) {
  const isLastStep = step === totalSteps;

  return (
    <>
      <div className="mt-10 flex items-center justify-between">
        {/* Back button — shown on steps 2+ */}
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-border-default px-5 text-[13px] font-semibold text-text-primary"
            onPress={onBackStep}
          >
            <ArrowLeftIcon className="mr-2 h-3.5 w-3.5" />
            Back
          </Button>
        ) : (
          <span />
        )}

        {/* Continue / Confirm button */}
        {!isLastStep ? (
          <Button
            type="button"
            isDisabled={step === 1 && !canContinue}
            className="h-11 rounded-full bg-brand-500 px-6 text-[13px] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            onPress={onContinue}
          >
            Continue
            <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={isSubmitting}
            isDisabled={!canSubmit || isSubmitting}
            className="h-11 rounded-full bg-brand-500 px-6 text-[13px] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            onPress={onConfirm}
          >
          {isUploading ? "Uploading photos…" : isSubmitting ? "Confirming…" : "Confirm booking"}
          {!isSubmitting && <ClockIcon className="ml-1.5 h-4 w-4" />}
          </Button>
        )}
      </div>
      {vehicleWarning}
      {errorMessage}
    </>
  );
}

