import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/authApi";

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ resetToken, password, confirmPassword }) =>
      authApi.resetPassword({
        resetToken,
        newPassword: password,
        confirmPassword,
      }),
    retry: 0,
  });
}
