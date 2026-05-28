import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Breadcrumbs, BreadcrumbsItem, Button } from "@heroui/react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Bars3Icon,
  RectangleGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const LABELS = {
  admin: {
    admin: "Dashboard",
    users: "Users",
    providers: "Providers",
    clients: "Clients",
    services: "Services",
    bookings: "Bookings",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
  },
  provider: {
    provider: "Dashboard",
    services: "Services",
    bookings: "Bookings",
    earnings: "Earnings",
    availability: "Availability",
    reviews: "Reviews",
    chat: "Chat",
    notifications: "Notifications",
    billing: "Billing",
    profile: "Profile",
    help: "Help",
    settings: "Settings",
  },
};

function titleCaseFromSegment(seg) {
  return seg
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildCrumbs(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const prefix = segments[0];
  const labelMap = LABELS[prefix] ?? {};

  let path = "";
  return segments.map((seg, idx) => {
    path += `/${seg}`;
    const label = labelMap[seg] ?? titleCaseFromSegment(seg);
    return {
      key: path,
      label,
      href: path,
      isLast: idx === segments.length - 1,
    };
  });
}

export default function DashboardTopbar({
  variant = "admin",
  onOpenSidebar,
  collapsed,
  onToggleCollapsed,
}) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  const crumbs = buildCrumbs(location.pathname);
  const pageTitle = crumbs.at(-1)?.label ?? "Dashboard";

  return (
    <header className="flex items-center justify-between h-[60px] px-4 sm:px-6 bg-white border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          className="hidden md:inline-flex"
          onPress={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <RectangleGroupIcon className="w-5 h-5 text-gray-300" />
        </Button>

        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          className="md:hidden"
          onPress={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-5 h-5 text-gray-300" />
        </Button>

        <div className="flex items-center gap-3 min-w-0">
          {crumbs.length > 1 ? (
            <Breadcrumbs
              size="sm"
              separator="/"
              className="min-w-0"
              itemClasses={{
                base: "text-xs",
                item: "text-gray-500 hover:text-gray-700 truncate",
                separator: "text-gray-300 px-1",
              }}
            >
              {crumbs.map((c) => (
                <BreadcrumbsItem
                  key={c.key}
                  isCurrent={c.isLast}
                  as={c.isLast ? "span" : Link}
                  to={c.isLast ? undefined : c.href}
                  className={c.isLast ? "text-gray-700" : undefined}
                >
                  {c.label}
                </BreadcrumbsItem>
              ))}
            </Breadcrumbs>
          ) : (
            <span className="text-sm font-medium text-gray-700 truncate">
              {pageTitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          as={Link}
          to={`/${variant}/notifications`}
          isIconOnly
          variant="light"
          aria-label="Notifications"
          className="text-gray-500 hover:text-gray-700"
        >
          <BellIcon className="w-5 h-5" />
        </Button>
        <UserAvatar
          user={user}
          className="h-9 w-9 ml-2"
        />
      </div>
    </header>
  );
}

