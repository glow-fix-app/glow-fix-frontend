import {
  UserIcon,
  TruckIcon,
  GiftIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Button, Card, Modal } from "@heroui/react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/client/hooks/useProfile";

const SETTINGS_MENU = [
  {
    id: "personal-info",
    label: "Personal Info",
    icon: UserIcon,
    path: "/settings/personal-info",
  },
  {
    id: "vehicles",
    label: "My Vehicles",
    icon: TruckIcon,
    path: "/settings/vehicles",
  },
  {
    id: "loyalty",
    label: "Loyalty & Rewards",
    icon: GiftIcon,
    path: "/settings/loyalty",
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheckIcon,
    path: "/settings/security",
  },
];

const SECONDARY_MENU = [
  {
    id: "help",
    label: "Help & Support",
    icon: QuestionMarkCircleIcon,
    path: "/settings/help",
  },
  {
    id: "delete",
    label: "Delete Account",
    icon: TrashIcon,
    path: "/settings/delete",
    color: "text-red-500",
  },
];

export default function ClientSettingsPage() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const deleteMutation = useDeleteAccount();

  const isBaseSettings = location.pathname === "/settings" || location.pathname === "/settings/";

  function handleLogout() {
    logout();
    navigate("/auth/login", { replace: true });
  }

  const handleDeleteAccount = () => {
    deleteMutation.mutate();
  };

  return (
    <section className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        {/* Sidebar / Menu - Hidden on mobile if viewing a sub-page */}
        <aside className={`${!isBaseSettings ? "hidden lg:flex" : "flex"} lg:sticky lg:top-6 lg:h-[calc(100vh-140px)] h-full flex-col gap-6`}>
          <Card className="flex h-full flex-col border-none bg-white p-6 shadow-sm ring-1 ring-black/5">
            <header className="mb-6 shrink-0">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Account</p>
              <div className="flex items-center gap-3">
                {/* <UserAvatar
                  user={user}
                  className="h-12 w-12"
                /> */}
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-text-primary">{user?.name || user?.full_name || "User"}</p>
                  <p className="truncate text-[12px] text-text-tertiary">{user?.email}</p>
                </div>
              </div>
            </header>

            <nav className="flex flex-1 flex-col justify-between">
              <div className="space-y-1">
                {SETTINGS_MENU.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => {
                      const isItemActive = isActive || (item.id === "personal-info" && isBaseSettings);
                      return `flex items-center justify-between rounded-xl px-3 py-3 transition-all ${isItemActive
                          ? "bg-gray-100 text-text-primary"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                        }`;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 opacity-40" />
                  </NavLink>
                ))}
              </div>

              <div className="space-y-1 pt-6">
                <hr className="mb-4 border-gray-100" />
                {SECONDARY_MENU.map((item) => {
                  if (item.id === "delete") {
                    return (
                      <Modal key={item.id}>
                        <Button
                          variant="light"
                          className="flex h-auto w-full items-center justify-start gap-3 rounded-xl p-3 text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary bg-transparent"
                        >
                          <item.icon className={`h-5 w-5 shrink-0 ${item.color || ""}`} />
                          <span className={`text-[14px] font-medium ${item.color || ""}`}>{item.label}</span>
                        </Button>
                        <Modal.Backdrop className="bg-black/20 backdrop-blur-sm z-[100]">
                          <Modal.Container className="flex items-center justify-center p-4">
                            <Modal.Dialog className="w-full max-w-md rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-black/5">
                              <Modal.Header className="flex-col items-start border-b border-gray-100 p-6">
                                <Modal.Heading className="text-[17px] font-semibold text-text-primary">
                                  Delete Account?
                                </Modal.Heading>
                                <p className="mt-1 text-[13px] text-text-tertiary">
                                  This action is permanent and cannot be undone.
                                </p>
                              </Modal.Header>
                              <Modal.Body className="p-6">
                                <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
                                  <p className="text-[13px] leading-relaxed text-red-800">
                                    All your data, including bookings, vehicle information, and loyalty points, will be permanently removed from our servers.
                                  </p>
                                </div>
                              </Modal.Body>
                              <Modal.Footer className="flex items-center justify-end gap-3 rounded-b-2xl bg-surface-hover p-6">
                                <Button
                                  variant="light"
                                  slot="close"
                                  className="h-10 rounded-xl text-[13px] font-semibold text-text-secondary"
                                >
                                  Keep Account
                                </Button>
                                <Button
                                  color="danger"
                                  isLoading={deleteMutation.isPending}
                                  onPress={handleDeleteAccount}
                                  className="h-10 rounded-xl bg-red-600 px-6 text-[13px] font-semibold text-white"
                                >
                                  Confirm Delete
                                </Button>
                              </Modal.Footer>
                            </Modal.Dialog>
                          </Modal.Container>
                        </Modal.Backdrop>
                      </Modal>
                    );
                  }

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary"
                    >
                      <item.icon className={`h-5 w-5 shrink-0 ${item.color || ""}`} />
                      <span className={`text-[14px] font-medium ${item.color || ""}`}>{item.label}</span>
                    </NavLink>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" />
                  <span className="text-[14px] font-medium">Sign out</span>
                </button>
              </div>
            </nav>
          </Card>
        </aside>

        {/* Content Area - Hidden on mobile if at base /settings path */}
        <main className={`${isBaseSettings ? "hidden lg:block" : "block"} h-full`}>
          {!isBaseSettings && (
            <button
              onClick={() => navigate("/settings")}
              className="mb-6 flex items-center gap-2 text-[13px] font-bold text-text-primary lg:hidden"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Menu
            </button>
          )}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
}
