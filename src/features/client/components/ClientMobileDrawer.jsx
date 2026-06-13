import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogout } from "@/features/auth/hooks/useLogout";
import logo from "@/assets/images/logo.svg";

export const CLIENT_NAV = [
  { to: "/", label: "Home", Icon: HomeIcon, end: true },
  { to: "/browse", label: "Services", Icon: MagnifyingGlassIcon },
  { to: "/providers", label: "Discover", Icon: MapIcon },
  { to: "/bookings", label: "Bookings", Icon: CalendarDaysIcon },
  { to: "/payments", label: "Payments", Icon: CreditCardIcon },
];

function getUserDisplayName(user) {
  return user?.name?.trim() || user?.full_name?.trim() || "Guest";
}

function ClientDrawerNavItem({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
          ? "bg-gray-100 text-text-primary font-semibold"
          : "text-text-tertiary hover:bg-gray-100"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 ${isActive ? "text-text-primary" : "text-text-tertiary"}`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function ClientDrawerPanel({ onRequestClose }) {
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const user = useSelector((state) => state.auth.user);

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
    onRequestClose?.();
  }

  return (
    <div className="flex h-full w-[min(100vw,18.5rem)] flex-col bg-white text-gray-700">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-200 px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-black/10"
            src={logo}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold italic text-text-primary">_GlowFix._</p>
            <p className="truncate text-xs text-text-tertiary">{getUserDisplayName(user)}</p>
          </div>
        </div>
        {onRequestClose && (
          <Button
            isIconOnly
            aria-label="Close menu"
            size="sm"
            variant="light"
            onPress={onRequestClose}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {CLIENT_NAV.map(({ to, label, Icon, end }) => (
          <ClientDrawerNavItem
            key={to}
            to={to}
            label={label}
            Icon={Icon}
            end={end}
            onNavigate={onRequestClose}
          />
        ))}
        <ClientDrawerNavItem
          to="/settings"
          label="Settings"
          Icon={Cog6ToothIcon}
          onNavigate={onRequestClose}
        />
      </nav>

      <div className="shrink-0 p-3">
        <Button
          variant="light"
          className="w-full justify-start rounded-xl text-gray-500 hover:bg-gray-200/70 hover:text-gray-700"
          onPress={handleLogout}
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0 text-current" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}

export default function ClientMobileDrawer({ isOpen = false, onClose }) {
  return (
    <div className={`md:hidden ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[9999] h-full transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <ClientDrawerPanel onRequestClose={onClose} />
      </aside>
    </div>
  );
}
