import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const clientApi = {
  // Services
  services: () => api.get(endpoints.services).then((res) => res.data),
  serviceDetails: (id) => api.get(`${endpoints.services}/${id}`).then((res) => res.data),

  // Bookings
  bookings: () => api.get(`${endpoints.client}/bookings?_expand=branch&_expand=vehicle`).then((res) => res.data),
  bookingDetails: (id) =>
    api
      .get(`${endpoints.client}/bookings/${id}?_expand=branch&_expand=vehicle&_embed=booking_items&_embed=booking_photos&_embed=diagnostic_reports&_embed=payments`)
      .then((res) => res.data),
  cancelBooking: (id) => api.patch(`${endpoints.client}/bookings/${id}`, { status: "cancelled" }).then((res) => res.data),
  reportDetails: async (reportId) => {
    const [report, findings, repairs] = await Promise.all([
      api.get(`${endpoints.diagnosticReports}/${reportId}`).then((r) => r.data),
      api.get(`${endpoints.reportFindings}?diagnostic_report_id=${reportId}`).then((r) => r.data),
      api.get(`${endpoints.recommendedRepairs}?diagnostic_report_id=${reportId}`).then((r) => r.data),
    ]);
    return {
      ...report,
      report_findings: findings,
      recommended_repairs: repairs,
    };
  },
  payBooking: (id) =>
    api.patch(`${endpoints.client}/bookings/${id}`, {
      status: "paid",
      paid_at: new Date().toISOString(),
    }).then((res) => res.data),
  createBooking: (data) => api.post(`${endpoints.bookings}/create`, data).then((res) => res.data),

  // Vehicles
  vehicles: () => api.get(`${endpoints.client}/vehicles`).then((res) => res.data),
  addVehicle: (data) => api.post(`${endpoints.client}/vehicles`, data).then((res) => res.data),
  updateVehicle: (id, data) => api.patch(`${endpoints.client}/vehicles/${id}`, data).then((res) => res.data),
  deleteVehicle: (id) => api.delete(`${endpoints.client}/vehicles/${id}`).then((res) => res.data),

  // Payments & Billing
  billingSummary: () =>
    api.get(`${endpoints.client}/billing/summary`).then((res) => res.data),
  payments: ({ page = 1, limit = 5 } = {}) =>
    api.get(`${endpoints.client}/payments?_expand=booking&_page=${page}&_limit=${limit}`)
      .then((res) => ({
        data: res.data,
        totalCount: parseInt(res.headers["x-total-count"] || "0", 10),
      })),
  paymentDetails: (id) => api.get(`${endpoints.client}/payments/${id}?_expand=booking`).then((res) => res.data),

  // Profile & Settings (users module on backend)
  profile: () => api.get(endpoints.users.me).then((res) => res.data),
  updateProfile: () =>
    Promise.reject(new Error("Profile updates are not available on the API yet.")),
  updateSecurity: (data) =>
    api
      .post(endpoints.auth.changePassword, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword ?? data.newPassword,
      })
      .then((res) => res.data),
  deleteAccount: () =>
    Promise.reject(new Error("Account deletion is not available on the API yet.")),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    // Let axios set multipart boundary — do not set Content-Type manually.
    return api.put(endpoints.users.avatar, formData).then((res) => res.data);
  },

  // Loyalty
  loyaltyConfig: () => api.get(endpoints.loyaltyConfig).then((res) => res.data),
  loyaltyTransactions: () => api.get(`${endpoints.client}/loyalty_transactions`).then((res) => res.data),
  redeemLoyaltyPoints: (data) => api.post(`${endpoints.client}/loyalty_transactions`, data).then((res) => res.data),

  // Others
  favorites: () => api.get(`${endpoints.client}/favorites`).then((res) => res.data),
  nearbyProviders: () => api.get(`${endpoints.client}/nearby-providers`).then((res) => res.data),

  // Discover – backend enriches data (ratings, distance, open status) in 1 call.
  // Filtering/sorting is done instantly on the frontend (no re-fetch).
  discover: ({
    userLocation = null,
    serviceType = "all",
    maxDistance,
    minRating = 0,
    openNow = false,
    search = "",
    searchType = "provider",
    sort = "recommended",
    signal,
  } = {}) => {
    const params = new URLSearchParams();
    if (userLocation?.lat != null) params.set("lat", userLocation.lat);
    if (userLocation?.lng != null) params.set("lng", userLocation.lng);
    if (serviceType !== "all") params.set("serviceType", serviceType);
    if (maxDistance != null) params.set("maxDistance", maxDistance);
    if (minRating > 0) params.set("minRating", minRating);
    if (openNow) params.set("openNow", "true");
    if (search) params.set("search", search);
    if (searchType !== "provider") params.set("searchType", searchType);
    if (sort !== "recommended") params.set("sort", sort);
    return api.get(`${endpoints.discover}?${params.toString()}`, { signal }).then((res) => res.data);
  },

  searchServices: ({ q = "", category = "all", lat, lng, maxDistance = 50 } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (lat != null) params.set("lat", lat);
    if (lng != null) params.set("lng", lng);
    if (maxDistance != null) params.set("maxDistance", maxDistance);
    return api.get(`${endpoints.services}/search?${params.toString()}`).then((res) => res.data);
  },

  providerDetails: (providerId, { userLocation = null } = {}) => {
    const params = new URLSearchParams();
    if (userLocation?.lat != null) params.set("lat", userLocation.lat);
    if (userLocation?.lng != null) params.set("lng", userLocation.lng);
    return api.get(`${endpoints.discover}/${providerId}?${params.toString()}`).then((res) => res.data);
  },
};
