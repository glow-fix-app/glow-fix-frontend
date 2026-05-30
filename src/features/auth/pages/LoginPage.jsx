import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@heroui/react";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FormField } from "@/features/auth/components/FormField";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema } from "@/features/auth/validation/authSchemas";
import { getSafeAuthRedirectPath, mapApiRole } from "@/features/auth/utils/authRedirect";
import { getGoogleAuthUrl } from "@/services/apiBase";
import { getApiErrorMessage } from "@/services/apiResponse";
import {
  isEmailVerificationRequired,
  isLoginRateLimited,
  getVerifyOtpRedirectState,
} from "@/features/auth/utils/emailVerification";

export default function LoginPage() {
  const login = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });
  const from = location.state?.from?.pathname;
  const resetSuccessMessage = location.state?.message;
  const sessionEndedMessage = (() => {
    const msg = sessionStorage.getItem("authSessionEnded");
    if (msg) {
      sessionStorage.removeItem("authSessionEnded");
      return msg;
    }
    return null;
  })();
  const query = new URLSearchParams(location.search);
  const oauthError = query.get("error");
  const oauthErrorDesc = query.get("error_description");

  useEffect(() => {
    if (sessionEndedMessage) {
      toast.warning(sessionEndedMessage);
    }
    if (resetSuccessMessage) {
      toast.success(resetSuccessMessage);
    }
    if (oauthError) {
      const desc =
        oauthError === "access_denied"
          ? "Google sign-in was canceled. You can try again or use your email and password."
          : oauthError === "google_email_not_verified"
            ? "Google did not confirm a verified email for this account."
            : "Google sign-in failed. Please try again or use your email and password.";
      toast.warning(desc);
    }
  }, [sessionEndedMessage, resetSuccessMessage, oauthError, oauthErrorDesc]);

  function handleGoogleSignIn() {
    localStorage.removeItem("isLoggedOut");
    window.location.href = getGoogleAuthUrl();
  }

  function onSubmit(values) {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data?.requiresMfa) return;
        const role = mapApiRole(data?.user?.role);
        navigate(getSafeAuthRedirectPath(role, from), { replace: true });
      },
      onError: (err) => {
        if (isEmailVerificationRequired(err)) {
          navigate("/auth/verify-otp", {
            replace: true,
            state: getVerifyOtpRedirectState({
              email: values.email,
              message: getApiErrorMessage(err),
              fromLogin: true,
            }),
          });
        } else if (isLoginRateLimited(err)) {
          toast.warning(getApiErrorMessage(err, "Too many login attempts. Please wait and try again."));
        } else {
          const status = err?.response?.status;
          const fallback =
            status === 500
              ? "A server error occurred during sign in. Please try again in a moment."
              : "Incorrect email or password. Please double-check and try again.";
          toast.danger(getApiErrorMessage(err, fallback));
        }
      },
    });
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <AuthHeader title="Welcome back" description="Access your account to manage bookings, service requests, messages, and settings." />

      <div className="space-y-4">
        <FormField
          error={errors.email?.message}
          icon={EnvelopeIcon}
          id="email"
          label="Email address"
          type="email"
          {...register("email")}
        />
        <div className="space-y-2">
          <PasswordInput
            error={errors.password?.message}
            icon={LockClosedIcon}
            id="password"
            label="Password"
            autoComplete="current-password"
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              className="text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary hover:underline underline-offset-2"
              to="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SubmitButton isLoading={login.isPending} loadingText="Logging in..." className="h-12 w-full text-base">
          Log in
        </SubmitButton>

        <div className="flex items-center gap-3 text-[12px] font-medium text-text-muted">
          <span className="h-px flex-1 bg-border-form" />
          <span className="shrink-0 whitespace-nowrap">or continue with Google</span>
          <span className="h-px flex-1 bg-border-form" />
        </div>
        <GoogleButton onPress={handleGoogleSignIn} />
      </div>

      <p className="text-center text-sm text-text-tertiary sm:text-left">
        Need an account? <AuthFooterLink to="/auth/register">Sign up</AuthFooterLink>
      </p>
    </form>
  );
}
