/**
 * API base path for HTTP calls. In dev we use same-origin `/api/v1` so the Vite proxy
 * forwards to the real backend; cookies (refresh) stay on the dev server origin.
 */
export function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return "/api/v1";
  }
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, "");
  }
  return "http://localhost:3000/api/v1";
}

/** Backend origin (no /api/v1 suffix). */
export function getApiOrigin() {
  const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET;
  if (proxyTarget && String(proxyTarget).trim()) {
    return String(proxyTarget).replace(/\/$/, "");
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  return String(apiUrl).replace(/\/api\/v1\/?$/, "").replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Google OAuth must start on the API host (not the Vite proxy).
 * Google redirects back to the API callback, then the API redirects to /auth/callback.
 */
export function getGoogleAuthUrl() {
  return `${getApiOrigin()}/api/v1/auth/google`;
}
