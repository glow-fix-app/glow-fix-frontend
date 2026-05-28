import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import LoadingScreen from "@/components/feedback/LoadingScreen";
import { authApi } from "@/features/auth/services/authApi";
import { setAccessToken, setCredentials } from "@/store/slices/authSlice";
import { getSafeAuthRedirectPath, mapApiRole } from "@/features/auth/utils/authRedirect";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      const token = searchParams.get("token");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        if (!cancelled) {
          setError(oauthError);
          navigate(`/auth/login?error=${encodeURIComponent(oauthError)}`, { replace: true });
        }
        return;
      }

      if (!token) {
        if (!cancelled) {
          navigate("/auth/login?error=missing_token", { replace: true });
        }
        return;
      }

      try {
        localStorage.removeItem("isLoggedOut");
        dispatch(setAccessToken({ accessToken: token }));

        const profile = await authApi.currentUser();
        if (cancelled) return;

        dispatch(setCredentials({ accessToken: token, user: profile }));
        const role = mapApiRole(profile?.role);
        navigate(getSafeAuthRedirectPath(role, "/"), { replace: true });
      } catch {
        if (!cancelled) {
          navigate("/auth/login?error=oauth_failed", { replace: true });
        }
      }
    }

    completeOAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate, searchParams]);

  if (error) {
    return <LoadingScreen label="Redirecting to sign in..." />;
  }

  return <LoadingScreen label="Completing sign in..." />;
}
