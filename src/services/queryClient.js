import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  currentUser: ["currentUser"],
  users: (params) => ["users", params],
  clients: (params) => ["clients", params],
  providers: (params) => ["providers", params],
  services: ["services"],
  bookings: ["bookings"],
  notifications: ["notifications"],
  chat: ["chat"],
  vehicles: ["vehicles"],
  payments: ["payments"],
  discover: ["discover"],
  serviceSearch: ["serviceSearch"],
  providerDetail: (id) => ["providerDetail", id],
  reviews: ["reviews"],
  operatingHours: ["operatingHours"],
  authSessions: ["authSessions"],
  loyalty: ["loyalty"],
  report: (id) => ["report", id],
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



