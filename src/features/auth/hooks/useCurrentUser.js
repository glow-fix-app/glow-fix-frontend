import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "@/features/auth/services/authApi";
import { queryKeys } from "@/services/queryClient";
import { setCurrentUser } from "@/store/slices/authSlice";

function normalizeUser(payload) {
  return payload?.user || payload || null;
}

export function useCurrentUser() {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authApi.currentUser,
    enabled: Boolean(localStorage.getItem("accessToken")),
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setCurrentUser(normalizeUser(query.data)));
    }
  }, [dispatch, query.data]);

  return query;
}



