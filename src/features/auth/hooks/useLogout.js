import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "@/features/auth/services/authApi";
import { clearCredentials } from "@/store/slices/authSlice";

export function useLogout() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      dispatch(clearCredentials({ explicitLogout: true }));
      queryClient.clear();
    },
  });
}

