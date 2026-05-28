import { getApiErrorMessage } from "@/services/apiResponse";

/** Backend returns 403 when login is blocked until email is verified (OTP re-sent). */
export function isEmailVerificationRequired(error) {
  if (error?.response?.status !== 403) return false;
  const message = getApiErrorMessage(error, "").toLowerCase();
  return message.includes("verify your email");
}

/** Backend returns 403 when Redis login rate limit is exceeded. */
export function isLoginRateLimited(error) {
  if (error?.response?.status !== 403) return false;
  const message = getApiErrorMessage(error, "").toLowerCase();
  return message.includes("too many login attempts");
}

export function getVerifyOtpRedirectState({ email, phone, message, fromLogin, fromRegistration, role }) {
  return {
    email: email || "",
    phone: phone || "",
    purpose: "EMAIL_VERIFICATION",
    role: role || "client",
    message:
      message ||
      (fromLogin
        ? "Please verify your email before logging in. A new code has been sent to your inbox."
        : "Enter the 6-digit code we sent to your email to activate your account."),
    fromLogin: Boolean(fromLogin),
    fromRegistration: Boolean(fromRegistration),
  };
}
