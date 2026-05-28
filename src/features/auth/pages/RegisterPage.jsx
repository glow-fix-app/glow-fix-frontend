import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@heroui/react";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FormField } from "@/features/auth/components/FormField";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { FileUploadField } from "@/features/auth/components/FileUploadField";
import BranchLocationPicker from "@/features/auth/components/BranchLocationPicker";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { createProviderRegisterResolver, providerWizardSteps } from "@/features/auth/validation/authSchemas";
import { getSafeAuthRedirectPath } from "@/features/auth/utils/authRedirect";
import { getGoogleAuthUrl } from "@/services/apiBase";
import { getApiErrorMessage } from "@/services/apiResponse";
import { getVerifyOtpRedirectState } from "@/features/auth/utils/emailVerification";

function mapServerRole(role) {
  if (!role) return role;
  const map = { CLIENT: "client", ADMIN: "admin", MANAGER: "provider", PROVIDER: "provider" };
  return map[String(role).toUpperCase()] || String(role).toLowerCase();
}

function RoleSwitch({ role, onChange }) {
  const options = [
    { label: "Client Account", value: "client" },
    { label: "Service Provider", value: "provider" },
  ];

  return (
    <div className="flex gap-8 border-b border-border-form">
      {options.map((option) => {
        const isActive = role === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`relative pb-4 text-sm font-extrabold transition-all ${
              isActive ? "text-brand-600" : "text-text-muted hover:text-text-secondary"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const registerUser = useRegister();
  const navigate = useNavigate();
  const location = useLocation();

  const [providerStep, setProviderStep] = useState(0);
  const providerStepRef = useRef(providerStep);
  providerStepRef.current = providerStep;

  const [googleNotice, setGoogleNotice] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: createProviderRegisterResolver(() => providerStepRef.current),
    defaultValues: {
      role: "client",
      branchLocation: null,
    },
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const role = useWatch({ control, name: "role" });
  const businessRegistration = useWatch({ control, name: "businessRegistration" });
  const ownerID = useWatch({ control, name: "ownerID" });
  const insuranceCertificate = useWatch({ control, name: "insuranceCertificate" });
  const serviceLicense = useWatch({ control, name: "serviceLicense" });

  const isProvider = role === "provider";

  const query = new URLSearchParams(location.search);
  const oauthError = query.get("error");
  const oauthErrorDesc = query.get("error_description");

  useEffect(() => {
    if (oauthError) {
      const desc = oauthError === "access_denied"
        ? "Google registration was canceled. You can try again or create an account with email and password."
        : oauthError === "google_email_not_verified"
          ? "Google did not confirm a verified email."
          : `Google registration failed: ${oauthError}${oauthErrorDesc ? ` — ${oauthErrorDesc}` : ""}`;
      toast.warning(desc);
    }
    if (googleNotice) {
      toast.warning("Google registration is ready in the UI. Connect OAuth credentials to activate it.");
    }
  }, [oauthError, oauthErrorDesc, googleNotice]);

  function handleGoogleSignIn() {
    localStorage.removeItem("isLoggedOut");
    window.location.href = getGoogleAuthUrl();
  }

  function changeRole(nextRole) {
    setValue("role", nextRole, { shouldDirty: true, shouldValidate: true });
    setProviderStep(0);
    setGoogleNotice(false);
  }

  async function nextProviderStep() {
    const fields = providerWizardSteps[providerStep].fields;
    const isValid = await trigger(fields, { shouldFocus: true });
    if (isValid) {
      setProviderStep((step) => Math.min(step + 1, providerWizardSteps.length - 1));
    }
  }

  function onInvalid(formErrors) {
    if (!isProvider) return;
    const stepWithError = providerWizardSteps.findIndex((step) =>
      step.fields.some((field) => formErrors[field]),
    );
    if (stepWithError >= 0) setProviderStep(stepWithError);
  }

  function onSubmit(formValues) {
    const values = isProvider ? { ...getValues(), ...formValues } : formValues;

    const payload = {
      fullName: values.name,
      email: String(values.email || "").trim(),
      phone: values.phone,
      password: values.password,
      confirmPassword: values.confirmPassword,
      role: values.role === "provider" ? "provider" : "client",
    };

    registerUser.mutate(payload, {
      onSuccess: (data) => {
        navigate("/auth/verify-otp", {
          replace: true,
          state: getVerifyOtpRedirectState({
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            message: data?.message,
            fromRegistration: true,
          }),
        });
      },
      onError: (err) => {
        toast.danger(getApiErrorMessage(
          err,
          "Please review your details and try again. If this keeps happening, ensure the API, database, Redis, and MailHog (SMTP) are running."
        ));
      },
    });
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="space-y-6">
        <AuthHeader title={isProvider ? "Register as provider" : "Register as client"} />
        <RoleSwitch onChange={changeRole} role={role} />
      </div>

      <div className="py-6">
        {/* ── CLIENT REGISTRATION ── */}
        {!isProvider ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField
                error={errors.name?.message}
                icon={UserIcon}
                id="name"
                label="Full name"
                {...register("name")}
              />
              <FormField
                error={errors.email?.message}
                icon={EnvelopeIcon}
                id="email"
                label="Email address"
                type="email"
                {...register("email")}
              />
              <FormField
                error={errors.phone?.message}
                icon={PhoneIcon}
                id="phone"
                label="Phone number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("phone")}
              />
              <PasswordInput
                error={errors.password?.message}
                icon={LockClosedIcon}
                id="password"
                label="Password"
                autoComplete="new-password"
                {...register("password")}
              />
              <PasswordInput
                error={errors.confirmPassword?.message}
                icon={LockClosedIcon}
                id="confirmPassword"
                label="Confirm password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </div>
          </div>
        ) : (
          /* ── PROVIDER REGISTRATION WIZARD ── */
          <div className="space-y-6">
            {/* Hidden fields to keep form state across steps */}
            {providerStep > 0 && (
              <div className="sr-only" aria-hidden="true">
                <input type="hidden" {...register("name")} />
                <input type="hidden" {...register("phone")} />
                <input type="hidden" {...register("email")} />
                <input type="hidden" {...register("password")} />
                <input type="hidden" {...register("confirmPassword")} />
                {providerStep > 1 && (
                  <>
                    <input type="hidden" {...register("businessName")} />
                    <input type="hidden" {...register("address")} />
                  </>
                )}
              </div>
            )}

            <div className="min-h-[300px]">
              {/* Step 0 – Account details */}
              {providerStep === 0 && (
                <div className="space-y-4">
                  <FormField
                    error={errors.name?.message}
                    icon={UserIcon}
                    id="name"
                    label="Owner name"
                    {...register("name")}
                  />
                  <FormField
                    error={errors.phone?.message}
                    icon={PhoneIcon}
                    id="phone"
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    {...register("phone")}
                  />
                  <FormField
                    error={errors.email?.message}
                    icon={EnvelopeIcon}
                    id="email"
                    label="Login email"
                    type="email"
                    {...register("email")}
                  />
                  <PasswordInput
                    error={errors.password?.message}
                    icon={LockClosedIcon}
                    id="password"
                    label="Password"
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  <PasswordInput
                    error={errors.confirmPassword?.message}
                    icon={LockClosedIcon}
                    id="confirmPassword"
                    label="Confirm password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                </div>
              )}

              {/* Step 1 – Branch details */}
              {providerStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    error={errors.businessName?.message}
                    icon={BuildingStorefrontIcon}
                    id="businessName"
                    label="Place name"
                    {...register("businessName")}
                  />
                  <FormField
                    error={errors.address?.message}
                    icon={MapPinIcon}
                    id="address"
                    label="Address"
                    {...register("address")}
                  />
                  <Controller
                    control={control}
                    name="branchLocation"
                    render={({ field }) => (
                      <BranchLocationPicker
                        error={errors.branchLocation?.message}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}

              {/* Step 2 – Documents */}
              {providerStep === 2 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <FileUploadField
                      error={errors.businessRegistration?.message}
                      id="businessRegistration"
                      label="Business Registration"
                      register={register}
                      fileName={businessRegistration?.[0]?.name}
                    />
                    <FileUploadField
                      error={errors.ownerID?.message}
                      id="ownerID"
                      label="Owner ID"
                      register={register}
                      fileName={ownerID?.[0]?.name}
                    />
                    <FileUploadField
                      error={errors.insuranceCertificate?.message}
                      id="insuranceCertificate"
                      label="Insurance Certificate"
                      register={register}
                      fileName={insuranceCertificate?.[0]?.name}
                    />
                    <FileUploadField
                      error={errors.serviceLicense?.message}
                      id="serviceLicense"
                      label="Service License"
                      register={register}
                      fileName={serviceLicense?.[0]?.name}
                    />
                  </div>
                  <p className="text-center text-[11px] font-medium italic text-text-tertiary">
                    Your provider account will be marked as under review after submission.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-border-form pt-5">
        <div className="flex flex-wrap items-center gap-4">
          {isProvider && providerStep > 0 ? (
            <Button
              className="min-h-11 rounded-full border border-border-form bg-white px-5 text-[13px] font-bold text-text-secondary transition-all hover:bg-surface-hover"
              onPress={() => setProviderStep((step) => step - 1)}
              type="button"
            >
              <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
              Back
            </Button>
          ) : null}

          {isProvider && providerStep < providerWizardSteps.length - 1 ? (
            <Button
              className="h-11 rounded-full bg-brand-500 px-8 text-[13px] font-bold text-white transition-all hover:bg-brand-600"
              onPress={nextProviderStep}
              type="button"
            >
              Continue
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
          ) : (
            <SubmitButton
              isLoading={registerUser.isPending}
              loadingText={isProvider ? "Submitting review..." : "Creating account..."}
              className={!isProvider ? "h-12 w-full text-base" : undefined}
            >
              {isProvider ? "Submit for review" : "Create account"}
            </SubmitButton>
          )}
        </div>

        {!isProvider ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[12px] font-medium text-text-muted">
              <span className="h-px flex-1 bg-border-form" />
              <span className="shrink-0 whitespace-nowrap">or continue with Google</span>
              <span className="h-px flex-1 bg-border-form" />
            </div>
            <GoogleButton onPress={handleGoogleSignIn} />
          </div>
        ) : null}

        <p className="text-[13px] text-text-tertiary">
          Already have an account? <AuthFooterLink to="/auth/login">Log in</AuthFooterLink>
        </p>
      </div>
    </form>
  );
}
