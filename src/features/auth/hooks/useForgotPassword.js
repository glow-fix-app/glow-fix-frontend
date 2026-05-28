import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/authApi";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) =>
      authApi.forgotPassword({
        identifier: String(email).trim(),
      }),
    retry: 0,
  });
}
