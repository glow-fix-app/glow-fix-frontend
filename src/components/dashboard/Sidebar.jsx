import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Button } from "@heroui/react";
import logoSrc from "@/assets/images/logo.svg";

// ── Heroicons (outline) ──────────────────────────────────────────────────────
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentChartBarIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// ── Nav config ───────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", Icon: Squares2X2Icon, end: true },
  { to: "/admin/providers", label: "Providers", Icon: BuildingStorefrontIcon },
  { to: "/admin/clients", label: "Customers", Icon: UsersIcon },
  { to: "/admin/bookings", label: "Bookings", Icon: CalendarDaysIcon },
  { to: "/admin/reviews", label: "Reviews", Icon: StarIcon },
  { to: "/admin/payments", label: "Payments", Icon: CreditCardIcon },
  { to: "/admin/analytics", label: "Analytics", Icon: ChartBarIcon },
  { to: "/admin/chat", label: "Chat", Icon: ChatBubbleLeftRightIcon },
  { to: "/admin/users", label: "Admin Accounts", Icon: ShieldCheckIcon },
  { to: "/admin/settings", label: "Settings", Icon: Cog6ToothIcon },
];

const PROVIDER_NAV = [
  { to: "/provider", label: "Dashboard", Icon: Squares2X2Icon, end: true },
  { to: "/provider/bookings", label: "Booking", Icon: CalendarDaysIcon },
  { to: "/provider/calendar", label: "Calendar", Icon: ClockIcon },
  { to: "/provider/services", label: "Services", Icon: WrenchScrewdriverIcon },
  { to: "/provider/chat", label: "Chat", Icon: ChatBubbleLeftRightIcon },
  { to: "/provider/reviews", label: "Reviews", Icon: StarIcon },
  { to: "/provider/analytics", label: "Analytics", Icon: ChartBarIcon },
  { to: "/provider/payouts", label: "Payouts", Icon: CreditCardIcon },
  { to: "/provider/profile", label: "Profile", Icon: UserCircleIcon },
  { to: "/provider/settings", label: "Settings", Icon: Cog6ToothIcon },
  { to: "/provider/help", label: "Help", Icon: QuestionMarkCircleIcon },
];

// ── Brand per variant ────────────────────────────────────────────────────────

const BRAND = {
  admin: {
    name: "Admin Panel",
    gradient: "from-violet-600 to-indigo-600",
  },
  provider: {
    name: "Provider Hub",
    gradient: "from-emerald-500 to-teal-600",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

function SidebarNavItem({
  to,
  label,
  Icon,
  end,
  collapsed,
  brand,
  onNavigate,
}) {
  return (
    <NavLink
      key={to}
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group
         ${collapsed ? "justify-center" : ""}
         ${isActive
          ? "bg-gray-100 text-gray-700 font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-700 font-medium"
        }`
      }
    >
      <Icon className="w-5 h-5 shrink-0 text-current" />
      {!collapsed && (
        <span className="text-[14px] text-inherit truncate">
          {label}
        </span>
      )}
    </NavLink>
  );
}

function SidebarPanel({
  variant,
  collapsed,
  onRequestClose,
}) {
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const nav = useMemo(
    () => (variant === "admin" ? ADMIN_NAV : PROVIDER_NAV),
    [variant],
  );
  const brand = useMemo(() => BRAND[variant] ?? BRAND.admin, [variant]);
  const sections = useMemo(() => {
    if (variant === "admin") {
      const settingsPaths = ["/admin/users", "/admin/settings"];
      return [
        {
          title: "General",
          items: nav.filter((item) => !settingsPaths.includes(item.to)),
        },
        {
          title: "Settings",
          items: nav.filter((item) => settingsPaths.includes(item.to)),
        },
      ];
    }

    const settingsPaths = ["/provider/settings", "/provider/help"];
    return [
      {
        title: "General",
        items: nav.filter(
          (item) => !settingsPaths.includes(item.to),
        ),
      },
      {
        title: "Settings",
        items: nav.filter((item) =>
          settingsPaths.includes(item.to),
        ),
      },
    ];
  }, [nav, variant]);

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
    onRequestClose?.();
  }

  return (
    <div
      className={`
        flex flex-col h-full bg-[rgb(250_250_250)]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div
        className={`flex items-center h-[60px] px-3 bg-transparent border-b border-gray-200 shrink-0 ${collapsed ? "justify-center" : "justify-between"
          }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="inline-flex items-center justify-center w-8 rounded-lg overflow-hidden p-0.5"
            >
              <img src={logoSrc} alt="Logo" className="w-full h-full object-contain" />
            </span>
            <span className="font-semibold text-gray-900 text-sm truncate">
              {brand.name}
            </span>
          </div>
        ) : (
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 border-gray-300 bg-white overflow-hidden p-0.5"
          >
            <img src={logoSrc} alt="Logo" className="w-full h-full object-contain" />
          </span>
        )}

        <div className="flex items-center gap-1">
          {onRequestClose && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onRequestClose}
              aria-label="Close sidebar"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-3">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(({ to, label, Icon, end }) => (
                <SidebarNavItem
                  key={to}
                  to={to}
                  label={label}
                  Icon={Icon}
                  end={end}
                  collapsed={collapsed}
                  brand={brand}
                  onNavigate={onRequestClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <Button
          variant="light"
          className={`w-full justify-start rounded-xl text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary font-medium bg-transparent ${collapsed ? "justify-center px-0" : "px-3 py-3 h-auto"
            }`}
          onPress={handleLogout}
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="text-[14px]">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar({
  variant = "admin",
  isOpen = false,
  onClose,
  collapsed = false,
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block h-screen shrink-0">
        <SidebarPanel
          variant={variant}
          collapsed={collapsed}
        />
      </aside>

      {/* Mobile slide-over */}
      <div className={`md:hidden ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={onClose}
          aria-hidden="true"
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
        >
          <SidebarPanel
            variant={variant}
            collapsed={false}
            onRequestClose={onClose}
          />
        </aside>
      </div>
    </>
  );
}
