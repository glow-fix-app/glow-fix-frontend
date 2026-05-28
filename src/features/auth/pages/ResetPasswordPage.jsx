import { useEffect } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@heroui/react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { resetPasswordSchema } from "@/features/auth/validation/authSchemas";
import { getApiErrorMessage } from "@/services/apiResponse";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const email = state.email || "";
  const resetToken = state.resetToken || "";

  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [email, resetToken, navigate]);

  function onSubmit(values) {
    resetPassword.mutate(
      {
        resetToken,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: (data) => {
          navigate("/auth/login", {
            replace: true,
            state: {
              message: data?.message || "Password reset successfully. Please sign in with your new password.",
            },
          });
        },
        onError: (err) => {
          toast.danger(
            getApiErrorMessage(
              err,
              "Invalid or expired code, or password does not meet requirements. Request a new code if needed."
            )
          );
        },
      },
    );
  }

  if (!email || !resetToken) {
    return null;
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <AuthHeader
        title="Choose a new password"
        description="Create a new password for your account. After this step you will sign in again."
      />

      <p className="text-[13px] text-text-secondary">
        Resetting password for <span className="font-semibold text-text-primary">{email}</span>
      </p>

      <div className="space-y-4">
        <PasswordInput
          error={errors.password?.message}
          icon={LockClosedIcon}
          id="password"
          label="New password"
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

      <div className="space-y-4">
        <SubmitButton isLoading={resetPassword.isPending} loadingText="Updating..." className="h-12 w-full text-base">
          Update password
        </SubmitButton>
      </div>
    </form>
  );
}
