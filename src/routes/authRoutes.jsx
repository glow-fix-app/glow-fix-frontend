import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthCallbackPage from "@/features/auth/pages/AuthCallbackPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ForgotPasswordCodePage from "@/features/auth/pages/ForgotPasswordCodePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import MfaPage from "@/features/auth/pages/MfaPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyOtpPage from "@/features/auth/pages/VerifyOtpPage";
import { PublicOnlyRoute } from "@/routes/guards";

export const authRoutes = {
  path: "/auth",
  children: [
    { path: "callback", element: <AuthCallbackPage /> },
    {
      element: (
        <PublicOnlyRoute>
          <AuthLayout />
        </PublicOnlyRoute>
      ),
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "verify-otp", element: <VerifyOtpPage /> },
        { path: "mfa", element: <MfaPage /> },
        { path: "forgot-password", element: <ForgotPasswordPage /> },
        { path: "reset-password/code", element: <ForgotPasswordCodePage /> },
        { path: "reset-password", element: <ResetPasswordPage /> },
      ],
    },
  ],
};
