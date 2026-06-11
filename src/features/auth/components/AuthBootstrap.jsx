import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingScreen from "@/components/feedback/LoadingScreen";
import { authApi } from "@/features/auth/services/authApi";
import {
  clearCredentials,
  setAccessToken,
  setCredentials,
  setCurrentUser,
  startAuthCheck,
  finishAuthCheck,
} from "@/store/slices/authSlice";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotificationSocket";
import { useUnreadMessages } from "@/features/chat/hooks/useUnreadMessages";

const ACCESS_TOKEN_KEY = "accessToken";
const LOGGED_OUT_KEY = "isLoggedOut";

function normalizeUser(payload) {
  return payload?.user || payload || null;
}

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const skipNextHydration = useRef(false);

  // Single persistent WebSocket connection tied to the auth session lifetime.
  // Connects once when the user is authenticated; disconnects on logout.
  useNotificationSocket();

  // Track unread messages globally so the badge shows on all pages.
  useUnreadMessages();

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (localStorage.getItem(LOGGED_OUT_KEY) === "true") {
        dispatch(clearCredentials());
        dispatch(finishAuthCheck());
        return;
      }

      dispatch(startAuthCheck());

      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!storedToken) {
        if (isMounted) {
          dispatch(clearCredentials());
          dispatch(finishAuthCheck());
        }
        return;
      }

      try {
        const me = await authApi.currentUser();
        const user = normalizeUser(me);

        if (isMounted && user) {
          skipNextHydration.current = true;
          dispatch(setCredentials({ accessToken: storedToken, user }));
        } else if (isMounted) {
          dispatch(clearCredentials());
        }
      } catch (error) {
        if (isMounted) {
          const httpStatus = error?.response?.status;
          if (httpStatus === 401 || httpStatus === 403) {
            sessionStorage.setItem(
              "authSessionEnded",
              "Your session has ended. Sign in again to continue.",
            );
            dispatch(clearCredentials());
          }
        }
      } finally {
        if (isMounted) {
          dispatch(finishAuthCheck());
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Login/MFA/OAuth only return a minimal user — fetch full profile (incl. avatarUrl).
  useEffect(() => {
    if (!isAuthenticated || localStorage.getItem(LOGGED_OUT_KEY) === "true") {
      return;
    }

    if (skipNextHydration.current) {
      skipNextHydration.current = false;
      return;
    }

    let cancelled = false;

    async function hydrateProfile() {
      try {
        const me = await authApi.currentUser();
        const user = normalizeUser(me);
        if (!cancelled && user) {
          dispatch(setCurrentUser(user));
        }
      } catch {
        // Session errors are handled by api interceptors / restoreSession.
      }
    }

    hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dispatch]);

  // Keep tabs in the same browser in sync when one tab signs in or out.
  useEffect(() => {
    async function onStorage(event) {
      if (event.key === LOGGED_OUT_KEY && event.newValue === "true") {
        dispatch(clearCredentials({ explicitLogout: true }));
        return;
      }

      if (event.key === ACCESS_TOKEN_KEY) {
        if (!event.newValue) {
          dispatch(clearCredentials());
          return;
        }

        dispatch(setAccessToken({ accessToken: event.newValue }));
        try {
          const me = await authApi.currentUser();
          const user = normalizeUser(me);
          if (user) {
            dispatch(setCurrentUser(user));
          }
        } catch {
          dispatch(clearCredentials());
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  if (status === "checking") {
    return <LoadingScreen label="Preparing your session..." />;
  }

  return children;
}
