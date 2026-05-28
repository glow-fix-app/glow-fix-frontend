import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminAnalyticsPage from "@/features/admin/pages/AdminAnalyticsPage";
import AdminBookingsPage from "@/features/admin/pages/AdminBookingsPage";
import AdminClientsPage from "@/features/admin/pages/AdminClientsPage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminProvidersPage from "@/features/admin/pages/AdminProvidersPage";
import AdminSettingsPage from "@/features/admin/pages/AdminSettingsPage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import AdminReviewsPage from "@/features/admin/pages/AdminReviewsPage";
import AdminPaymentsPage from "@/features/admin/pages/AdminPaymentsPage";
import AdminNotificationsPage from "@/features/admin/pages/AdminNotificationsPage";
import AdminChatPage from "@/features/admin/pages/AdminChatPage";

export const adminRoutes = {
  path: "/admin",
  element: <DashboardLayout variant="admin" />,
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: "users", element: <AdminUsersPage /> },
    { path: "providers", element: <AdminProvidersPage /> },
    { path: "clients", element: <AdminClientsPage /> },
    { path: "bookings", element: <AdminBookingsPage /> },
    { path: "analytics", element: <AdminAnalyticsPage /> },
    { path: "settings", element: <AdminSettingsPage /> },
    { path: "reviews", element: <AdminReviewsPage /> },
    { path: "payments", element: <AdminPaymentsPage /> },
    { path: "notifications", element: <AdminNotificationsPage /> },
    { path: "chat", element: <AdminChatPage /> },
  ],
};




