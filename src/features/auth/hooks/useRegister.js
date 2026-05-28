import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/authApi";

export function useRegister() {
  return useMutation({
    mutationFn: (payload) => {
      const body = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      };

      if (payload.role === "manager") {
        return authApi.registerManager(body);
      }
      return authApi.registerClient(body);
    },
  });
}
