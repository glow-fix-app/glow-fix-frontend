import { useState } from "react";
import { Bars3Icon, BellIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Avatar, Badge, Button, Link } from "@heroui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ClientMobileDrawer, { CLIENT_NAV } from "@/features/client/components/ClientMobileDrawer";
import { useNotificationList } from "@/features/notifications/hooks/useNotificationList";
import logo from "@/assets/images/logo.svg";

import { UserAvatar } from "@/components/ui/UserAvatar";

function getUnreadCount(notifications) {
  const list = Array.isArray(notifications) ? notifications : notifications?.data;
  if (!Array.isArray(list)) return 0;
  return list.filter((item) => !item.readAt).length;
}

export default function PublicNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const notifications = useNotificationList();
  const unreadCount = getUnreadCount(notifications.data);
  const unreadMessages = useSelector((state) => state.chat.unreadTotal ?? 0);

  function openProfile() {
    navigate(user || isAuthenticated ? "/settings" : "/auth/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link asChild className="z-10 shrink-0">
            <NavLink className="flex items-center gap-2.5" to="/">
              <span className="flex shrink-0 items-center justify-center">
                <img alt="GlowFix" className="h-8 w-auto" src={logo} />
              </span>
              <span className="hidden text-[17px] font-bold italic tracking-tight text-text-primary sm:inline">
                _Glow<span className="text-brand-500">Fix</span>._
              </span>
            </NavLink>
          </Link>

          <nav
            aria-label="Main"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex"
          >
            {CLIENT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive
                    ? "bg-brand-500 !text-white"
                    : "text-text-tertiary hover:text-text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="z-10 flex items-center gap-2">
            <Button
              isIconOnly
              aria-label="Messages"
              className="text-text-tertiary hover:text-text-primary"
              variant="light"
              radius="none"
              onPress={() => navigate("/chat")}
            >
              <Badge.Anchor>
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                <Badge
                  className={
                    unreadMessages > 0
                      ? "min-h-2.5 min-w-2.5 border-2 border-white bg-red-500 p-0"
                      : "hidden"
                  }
                  color="danger"
                  placement="top-right"
                  size="sm"
                >
                  {null}
                </Badge>
              </Badge.Anchor>
            </Button>

            <Button
              isIconOnly
              aria-label="Notifications"
              className="text-text-tertiary hover:text-text-primary"
              variant="light"
              radius="none"
              onPress={() => navigate("/notifications")}
            >
              <Badge.Anchor>
                <BellIcon className="h-6 w-6" />
                <Badge
                  className={
                    unreadCount > 0
                      ? "min-h-2.5 min-w-2.5 border-2 border-white bg-red-500 p-0"
                      : "hidden"
                  }
                  color="danger"
                  placement="top-right"
                  size="sm"
                >
                  {unreadCount > 0 ? (
                    <Badge.Label>{unreadCount > 9 ? "9+" : unreadCount}</Badge.Label>
                  ) : null}
                </Badge>
              </Badge.Anchor>
            </Button>

            <button
              aria-label="Open profile"
              className="flex items-center justify-center outline-none transition-transform hover:scale-105 active:scale-95"
              onClick={openProfile}
            >
              <UserAvatar
                user={user}
                className="h-10 w-10"
              />
            </button>

            <Button
              isIconOnly
              aria-label="Open menu"
              className="h-10 w-10 rounded-full border border-border-default bg-white text-text-tertiary md:hidden"
              variant="bordered"
              onPress={() => setMenuOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <ClientMobileDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
