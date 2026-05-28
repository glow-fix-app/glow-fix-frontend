import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useDispatch } from "react-redux";
import { setCurrentUser, clearCredentials } from "@/store/slices/authSlice";
import { ROUTE_PATHS } from "@/routes/paths";
import { toast } from "@heroui/react";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: clientApi.profile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: clientApi.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      if (data?.user) {
        dispatch(setCurrentUser(data.user));
      }
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.danger(err?.response?.data?.message || "Failed to update profile.");
    },
  });
}

export function useDeleteAccount() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.deleteAccount,
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      window.location.href = ROUTE_PATHS.AUTH_LOGIN;
    },
  });
}
