import { createSlice } from "@reduxjs/toolkit";

import { mapApiRole } from "@/features/auth/constants/roles";

const ACCESS_TOKEN_KEY = "accessToken";
const LOGGED_OUT_KEY = "isLoggedOut";

function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function resolveAccessToken(payload) {
  return payload?.accessToken || payload?.token || null;
}

/** Shape API user payloads before storing in auth state. */
function normalizeUser(user) {
  if (!user) return null;
  const u = { ...user };

  if (!u.name) {
    if (u.fullName) u.name = u.fullName;
    else if (u.full_name) u.name = u.full_name;
    else if (u.first_name || u.firstName) {
      const first = u.first_name || u.firstName || "";
      const last = u.last_name || u.lastName || "";
      u.name = `${first} ${last}`.trim();
    }
  }

  if (u.phoneVerified != null && u.phone_verified == null) {
    u.phone_verified = u.phoneVerified;
  }
  if (u.emailVerified != null && u.email_verified == null) {
    u.email_verified = u.emailVerified;
  }

  if (u.role && typeof u.role === "string") {
    u.role = mapApiRole(u.role);
  }

  return u;
}

const storedToken = getStoredAccessToken();

const initialState = {
  user: null,
  accessToken: storedToken,
  token: storedToken,
  isAuthenticated: false,
  status: "checking",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startAuthCheck(state) {
      state.status = "checking";
    },
    setCredentials(state, action) {
      const accessToken = resolveAccessToken(action.payload) ?? state.accessToken;

      const rawUser = action.payload?.user ?? null;
      state.user = normalizeUser(rawUser);
      state.accessToken = accessToken;
      state.token = accessToken;
      state.isAuthenticated = Boolean(state.user);
      state.status = state.user ? "authenticated" : "guest";

      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }
      localStorage.removeItem(LOGGED_OUT_KEY);
    },
    setAccessToken(state, action) {
      const accessToken = resolveAccessToken(action.payload);

      state.accessToken = accessToken;
      state.token = accessToken;

      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }
    },
    setCurrentUser(state, action) {
      const raw = action.payload?.user ?? action.payload;
      state.user = normalizeUser(raw);
      state.isAuthenticated = Boolean(state.user);
      state.status = state.user ? "authenticated" : "guest";
    },
    finishAuthCheck(state) {
      if (state.status === "checking") {
        state.status = state.isAuthenticated ? "authenticated" : "guest";
      }
    },
    clearCredentials(state, action) {
      state.user = null;
      state.accessToken = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "guest";
      localStorage.removeItem(ACCESS_TOKEN_KEY);

      if (action.payload?.explicitLogout) {
        localStorage.setItem(LOGGED_OUT_KEY, "true");
      }
    },
  },
});

export const { clearCredentials, finishAuthCheck, setAccessToken, setCredentials, setCurrentUser, startAuthCheck } = authSlice.actions;
export default authSlice.reducer;
