import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "@heroui/react";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { authApi } from "@/features/auth/services/authApi";
import { OTP_PURPOSE } from "@/features/auth/constants/otpPurposes";
import { getApiErrorMessage } from "@/services/apiResponse";

export default function ForgotPasswordCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const email = state.email || "";

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authApi.verifyOtp({
        email,
        otp,
        purpose: "PASSWORD_RESET",
      });
      navigate("/auth/reset-password", {
        replace: true,
        state: { email, resetToken: data.resetToken },
      });
    } catch (err) {
      setOtpError(getApiErrorMessage(err, "Invalid or expired code. Request a new one."));
      toast.danger(getApiErrorMessage(err, "Invalid or expired code. Request a new one."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      const result = await authApi.resendOtp({
        email: email || undefined,
        purpose: OTP_PURPOSE.PASSWORD_RESET,
      });
      toast.success(result?.message || "A new code has been sent to your email.");
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Could not resend code."));
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={onSubmit}>
      <AuthHeader
        title="Enter reset code"
        description={`Enter the 6-digit code sent to ${email}.`}
      />

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
          Continue to new password
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

        <div className="flex items-center gap-4 text-sm text-text-tertiary">
          <AuthFooterLink to="/auth/forgot-password">
            Change email
          </AuthFooterLink>
          <span className="h-4 w-px bg-border-form"></span>
          <AuthFooterLink to="/auth/login">
            Back to sign in
          </AuthFooterLink>
        </div>
      </div>
    </form>
  );
}
