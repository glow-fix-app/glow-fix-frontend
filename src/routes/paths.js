export const ROUTE_PATHS = {
  AUTH_LOGIN: "/auth/login",
  PAYMENTS: "/payments",
  PAYMENT_RECEIPT: (id) => `/payments/${id}`,
  SERVICES: "/services",
  BOOKINGS: "/bookings",
  PROVIDER_DETAIL: (id) => `/services/${id}`,
  CHECKOUT: (providerId) => `/checkout/${providerId}`,
  CHECKOUT_CONFIRMED: (providerId) => `/checkout/${providerId}/confirmed`,
  BOOKING_DETAIL: (id) => `/bookings/${id}`,
  BOOKING_REPORT: (id) => `/bookings/${id}/report`,
  BOOKING_PAY: (id) => `/bookings/${id}/pay`,
};
