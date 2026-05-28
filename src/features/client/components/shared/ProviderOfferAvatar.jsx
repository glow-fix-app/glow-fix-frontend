import { getAvatarStyle, getInitials } from "@/features/client/lib/providerDisplay";

export default function ProviderOfferAvatar({ name, className = "" }) {
  const style = getAvatarStyle(name);
  const initials = getInitials(name);

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[15px] font-bold tracking-tight ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {initials || "?"}
    </div>
  );
}
