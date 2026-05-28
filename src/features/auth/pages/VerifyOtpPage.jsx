import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "@heroui/react";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FormField } from "@/features/auth/components/FormField";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { authApi } from "@/features/auth/services/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { getSafeAuthRedirectPath } from "@/features/auth/utils/authRedirect";
import { getApiErrorMessage } from "@/services/apiResponse";

import { mapApiRole } from "@/features/auth/constants/roles";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const state = location.state || {};

  const initialEmail = state.email || searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const phone = state.phone || "";
  const purpose = state.purpose || "EMAIL_VERIFICATION";
  const redirectRole = state.role || "client";
  const fromLogin = Boolean(state.fromLogin);
  const fromRegistration = Boolean(state.fromRegistration);
  const title = fromLogin
    ? "Verify your email to sign in"
    : fromRegistration
      ? "Confirm your email"
      : "Verify your email";

  const description = fromLogin
    ? "Your email must be verified before you can log in. Enter the 6-digit code sent to your inbox (check spam if you do not see it)."
    : fromRegistration
      ? "We sent a verification code to your email. Enter it below to activate your account."
      : "Enter the 6-digit verification code sent to your email address.";

  async function handleVerify(e) {
    e.preventDefault();
    setOtpError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail && !phone) {
      toast.danger("Enter the email address you used to register.");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authApi.verifyOtp({
        email: trimmedEmail || undefined,
        phone: phone || undefined,
        otp,
        purpose,
      });

      const user = data?.user
        ? { ...data.user, emailVerified: true, email_verified: true }
        : data?.user;

      dispatch(setCredentials({ ...data, user }));
      navigate(getSafeAuthRedirectPath(mapApiRole(user?.role || data?.user?.role) || redirectRole), {
        replace: true,
      });
    } catch (err) {
      setOtpError(getApiErrorMessage(err, "Invalid or expired code."));
      toast.danger(getApiErrorMessage(err, "Invalid or expired code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail && !phone) {
      toast.danger("Enter your email address to resend the code.");
      return;
    }

    // Backend requires exactly one of email OR phone — prefer email.
    const identifier = trimmedEmail
      ? { email: trimmedEmail }
      : { phone };

    setIsResending(true);
    try {
      const result = await authApi.resendOtp({ ...identifier, purpose });
      toast.success(result?.message || "A new code has been sent to your email.");
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Could not resend code."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleVerify}>
      <AuthHeader title={title} description={description} />

      {!initialEmail && !fromRegistration ? (
        <FormField
          id="verify-email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      ) : (
        <p className="text-[13px] text-text-secondary">
          Code sent to <span className="font-semibold text-text-primary">{email || "your email"}</span>
        </p>
      )}

      <OtpInput
        value={otp}
        onChange={(val) => {
          setOtp(val);
          setOtpError("");
        }}
        error={otpError}
      />

      <div className="space-y-4">
        <SubmitButton isLoading={isSubmitting} isDisabled={otp.length !== 6} className="h-12 w-full text-base">
          {fromLogin ? "Verify email and sign in" : "Verify and continue"}
        </SubmitButton>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm text-text-tertiary">
          Didn't receive a code?{" "}
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="font-semibold text-brand-600 transition-colors hover:text-brand-500 hover:underline"
          >
            {isResending ? "Resending..." : "Resend"}
          </button>
        </p>

        <AuthFooterLink to="/auth/login">
          Back to sign in
        </AuthFooterLink>
      </div>
    </form>
  );
}
