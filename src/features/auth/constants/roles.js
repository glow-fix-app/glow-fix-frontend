export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CLIENT: "client",
};

export function mapApiRole(role) {
  if (!role) return role;
  return ROLES[String(role).toUpperCase()] || String(role).toLowerCase();
}
