import ClientLayout from "@/features/client/components/ClientLayout";
import ClientChatLayout from "@/features/client/components/ClientChatLayout";
import BookingCheckoutPage from "@/features/client/pages/BookingCheckoutPage";
import BookingCheckoutConfirmedPage from "@/features/client/pages/BookingCheckoutConfirmedPage";
import BookingDetailPage from "@/features/client/pages/BookingDetailPage";
import BookingPaymentPage from "@/features/client/pages/BookingPaymentPage";
import BookingReportPage from "@/features/client/pages/BookingReportPage";
import ClientBookingsPage from "@/features/client/pages/ClientBookingsPage";
import ClientChatPage from "@/features/client/pages/ClientChatPage";
import ClientHomePage from "@/features/client/pages/ClientHomePage";
import ClientNotificationsPage from "@/features/client/pages/ClientNotificationsPage";
import ClientPaymentsPage from "@/features/client/pages/ClientPaymentsPage";
import ClientPaymentReceiptPage from "@/features/client/pages/ClientPaymentReceiptPage";
import ClientProfilePage from "@/features/client/pages/ClientProfilePage";
import ClientDiscoverPage from "@/features/client/pages/ClientDiscoverPage";
import ClientServiceSearchPage from "@/features/client/pages/ClientServiceSearchPage";
import ClientSettingsPage from "@/features/client/pages/ClientSettingsPage";
import ClientVehiclesPage from "@/features/client/pages/ClientVehiclesPage";
import ClientLoyaltyPage from "@/features/client/pages/ClientLoyaltyPage";
import ClientSecurityPage from "@/features/client/pages/ClientSecurityPage";
import ClientHelpPage from "@/features/client/pages/ClientHelpPage";
import ProviderDetailPage from "@/features/client/pages/ProviderDetailPage";

// Chat gets its own layout (no footer, no container padding, full height)
export const clientChatRoutes = {
  element: <ClientChatLayout />,
  children: [
    { path: "chat", element: <ClientChatPage /> },
  ],
};

export const clientRoutes = {
  element: <ClientLayout />,
  children: [
    { index: true, element: <ClientHomePage /> },
    { path: "providers/:providerId", element: <ProviderDetailPage /> },
    { path: "providers", element: <ClientDiscoverPage /> },
    { path: "browse", element: <ClientServiceSearchPage /> },
    { path: "checkout/:providerId/confirmed", element: <BookingCheckoutConfirmedPage /> },
    { path: "checkout/:providerId", element: <BookingCheckoutPage /> },
    { path: "bookings", element: <ClientBookingsPage /> },
    { path: "bookings/:bookingId", element: <BookingDetailPage /> },
    { path: "bookings/:bookingId/pay", element: <BookingPaymentPage /> },
    { path: "bookings/:bookingId/report", element: <BookingReportPage /> },
    { path: "payments", element: <ClientPaymentsPage /> },
    { path: "payments/:receiptId", element: <ClientPaymentReceiptPage /> },
    { path: "notifications", element: <ClientNotificationsPage /> },
    {
      path: "settings",
      element: <ClientSettingsPage />,
      children: [
        { index: true, element: <ClientProfilePage /> },
        { path: "personal-info", element: <ClientProfilePage /> },
        { path: "vehicles", element: <ClientVehiclesPage /> },
        { path: "loyalty", element: <ClientLoyaltyPage /> },
        { path: "security", element: <ClientSecurityPage /> },
        { path: "help", element: <ClientHelpPage /> },
      ]
    },
  ],
};





