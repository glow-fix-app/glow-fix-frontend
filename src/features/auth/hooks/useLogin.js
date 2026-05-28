import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/services/authApi";
import { setCredentials } from "@/store/slices/authSlice";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    retry: 0,
    onSuccess: (data) => {
      if (data?.requiresMfa && data?.mfaToken) {
        navigate("/auth/mfa", { state: { mfaToken: data.mfaToken }, replace: true });
        return;
      }
      dispatch(setCredentials(data));
    },
  });
}
