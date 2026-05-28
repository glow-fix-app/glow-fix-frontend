import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FormField } from "@/features/auth/components/FormField";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { forgotPasswordSchema } from "@/features/auth/validation/authSchemas";
import { getApiErrorMessage } from "@/services/apiResponse";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  function onSubmit(values) {
    const email = String(values.email).trim();
    forgotPassword.mutate(email, {
      onSuccess: (data) => {
        navigate("/auth/reset-password/code", {
          replace: true,
          state: {
            email,
            message:
              data?.message ||
              "If an account exists, a password reset code has been sent to your email.",
          },
        });
      },
      onError: (err) => {
        toast.danger(getApiErrorMessage(err, "Unable to send reset code. Try again later."));
      },
    });
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <AuthHeader
        title="Reset your password"
        description="Enter the email linked to your account. We will send a 6-digit code to reset your password."
      />

      <FormField
        error={errors.email?.message}
        icon={EnvelopeIcon}
        id="email"
        label="Email address"
        placeholder="you@example.com"
        type="email"
        autoComplete="email"
        {...register("email")}
      />

      <div className="space-y-4">
        <SubmitButton isLoading={forgotPassword.isPending} loadingText="Sending code..." className="h-12 w-full text-base">
          Send reset code
        </SubmitButton>
      </div>

      <p className="text-center text-sm text-text-tertiary sm:text-left">
        Remember your password? <AuthFooterLink to="/auth/login">Back to sign in</AuthFooterLink>
      </p>
    </form>
  );
}
