import { getAvatarStyle, getInitials } from "@/features/client/lib/providerDisplay";

export default function ProviderOfferAvatar({ name, avatarUrl, className = "" }) {
  const style = getAvatarStyle(name);
  const initials = getInitials(name);

  return (
    <div
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[15px] font-bold tracking-tight overflow-hidden ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
