import { ROLES } from "@/features/auth/constants/roles";
export { mapApiRole } from "@/features/auth/constants/roles";

const roleHomePaths = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.MANAGER]: "/provider",
  [ROLES.CLIENT]: "/",
};

const rolePathPrefixes = {
  [ROLES.ADMIN]: ["/admin"],
  [ROLES.MANAGER]: ["/provider"],
  [ROLES.CLIENT]: ["/", "/providers", "/browse", "/checkout", "/bookings", "/payments", "/chat", "/notifications", "/billing", "/help", "/settings", "/profile"],
};

export function getAuthRedirectPath(role) {
  return roleHomePaths[role] || "/";
}

export function isPathAllowedForRole(path, role) {
  const allowedPrefixes = rolePathPrefixes[role] || [];

  return allowedPrefixes.some((prefix) => {
    if (prefix === "/") {
      return path === "/";
    }

    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

export function getSafeAuthRedirectPath(role, requestedPath) {
  if (requestedPath && isPathAllowedForRole(requestedPath, role)) {
    return requestedPath;
  }

  return getAuthRedirectPath(role);
}





