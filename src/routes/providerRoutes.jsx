import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateProviderServicePage from "@/features/provider/pages/CreateProviderServicePage";
import EditProviderServicePage from "@/features/provider/pages/EditProviderServicePage";
import ProviderBookingsPage from "@/features/provider/pages/ProviderBookingsPage";
import ProviderBookingDetailPage from "@/features/provider/pages/ProviderBookingDetailPage";
import ProviderCalendarPage from "@/features/provider/pages/ProviderCalendarPage";
import ProviderChatPage from "@/features/provider/pages/ProviderChatPage";
import ProviderDashboardPage from "@/features/provider/pages/ProviderDashboardPage";
import ProviderAnalyticsPage from "@/features/provider/pages/ProviderAnalyticsPage";
import ProviderPayoutsPage from "@/features/provider/pages/ProviderPayoutsPage";
import ProviderHelpPage from "@/features/provider/pages/ProviderHelpPage";
import ProviderNotificationsPage from "@/features/provider/pages/ProviderNotificationsPage";
import ProviderProfilePage from "@/features/provider/pages/ProviderProfilePage";
import ProviderReviewsPage from "@/features/provider/pages/ProviderReviewsPage";
import ProviderServicesPage from "@/features/provider/pages/ProviderServicesPage";
import ProviderSettingsPage from "@/features/provider/pages/ProviderSettingsPage";

export const providerRoutes = {
  path: "/provider",
  element: <DashboardLayout variant="provider" />,
  children: [
    { index: true, element: <ProviderDashboardPage /> },
    { path: "bookings", element: <ProviderBookingsPage /> },
    { path: "bookings/:id", element: <ProviderBookingDetailPage /> },
    { path: "calendar", element: <ProviderCalendarPage /> },
    { path: "services", element: <ProviderServicesPage /> },
    { path: "services/create", element: <CreateProviderServicePage /> },
    { path: "services/:serviceId/edit", element: <EditProviderServicePage /> },
    { path: "chat", element: <ProviderChatPage /> },
    { path: "reviews", element: <ProviderReviewsPage /> },
    { path: "analytics", element: <ProviderAnalyticsPage /> },
    { path: "payouts", element: <ProviderPayoutsPage /> },
    { path: "profile", element: <ProviderProfilePage /> },
    { path: "notifications", element: <ProviderNotificationsPage /> },
    { path: "settings", element: <ProviderSettingsPage /> },
    { path: "help", element: <ProviderHelpPage /> },
  ],
};




