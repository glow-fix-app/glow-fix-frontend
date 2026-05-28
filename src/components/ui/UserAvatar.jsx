import React from "react";
import { Avatar } from "@heroui/react";

/** Backend profile field: `avatarUrl` (from GET /users/me). */
function getAvatarUrl(user) {
  const url = user?.avatarUrl;
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getDisplayName(user) {
  return (
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.full_name?.trim() ||
    "User"
  );
}

function getInitials(user) {
  const name = getDisplayName(user);
  if (name === "User") return "U";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarKey(user) {
  return `${user?.id ?? "guest"}-${getAvatarUrl(user) ?? "none"}`;
}

export const UserAvatar = ({
  user,
  className = "h-10 w-10",
  radius = "full",
  bg = "bg-white",
  shadow = "",
  ring = "",
  ...props
}) => {
  const avatarSrc = getAvatarUrl(user);

  return (
    <Avatar
      key={getAvatarKey(user)}
      radius={radius}
      className={`${className} ${bg} ${shadow} ${ring} border border-gray-200 shrink-0`}
      {...props}
    >
      {avatarSrc ? <Avatar.Image src={avatarSrc} alt="" /> : null}
      <Avatar.Fallback className="font-medium text-text-secondary">{getInitials(user)}</Avatar.Fallback>
    </Avatar>
  );
};
