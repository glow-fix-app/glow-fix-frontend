import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const clientApi = {
  // Services
  services: () => api.get(endpoints.services).then((res) => res.data),
  serviceDetails: (id) => api.get(`${endpoints.services}/${id}`).then((res) => res.data),
  categories: () => api.get(endpoints.categories).then((res) => res.data),

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
  vehicles: () => api.get(endpoints.vehicles).then((res) => res.data),
  addVehicle: (data) => api.post(endpoints.vehicles, data).then((res) => res.data),
  updateVehicle: (id, data) => api.put(`${endpoints.vehicles}/${id}`, data).then((res) => res.data),
  deleteVehicle: (id) => api.delete(`${endpoints.vehicles}/${id}`).then((res) => res.data),

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
  updateProfile: (data) =>
    api.put(endpoints.users.me, data).then((res) => res.data),
  updateSecurity: (data) =>
    api
      .post(endpoints.auth.changePassword, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword ?? data.newPassword,
      })
      .then((res) => res.data),
  deleteAccount: () => api.delete(endpoints.users.me).then((res) => res.data),
  updateLocation: (data) => api.put("/clients/me/location", data).then((res) => res.data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    // Let axios set multipart boundary — do not set Content-Type manually.
    return api.put(endpoints.users.avatar, formData).then((res) => res.data);
  },
  deleteAvatar: () => api.delete(endpoints.users.avatar).then((res) => res.data),

  // Loyalty — all under GET/POST /loyalty/*
  loyaltySummary: () =>
    api.get("/loyalty/summary").then((res) => res.data),
  loyaltyTransactions: ({ page = 1, limit = 20, type } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.set("type", type);
    return api.get(`/loyalty/transactions?${params.toString()}`).then((res) => res.data);
  },
  loyaltyQuickRedeem: () =>
    api.get("/loyalty/quick-redeem").then((res) => res.data),
  loyaltyRedeem: (points) =>
    api.post("/loyalty/redeem", { points }).then((res) => res.data),

  // Others
  favorites: () => api.get(`${endpoints.client}/favorites`).then((res) => res.data),
  nearbyProviders: () => api.get(`${endpoints.client}/nearby-providers`).then((res) => res.data),

  // Discover – backend enriches data (ratings, distance, open status) in 1 call.
  // Filtering/sorting is done instantly on the frontend (no re-fetch).
  discover: ({
    userLocation = null,
    city = null,
    serviceType = "all",
    maxDistance,
    minRating = 0,
    openNow = false,
    search = "",
    searchType = "provider", // backend doesn't use searchType, we'll keep it for frontend compatibility if needed
    sort = "recommended",
    signal,
  } = {}) => {
    const params = new URLSearchParams();
    if (userLocation?.lat != null) params.set("latitude", userLocation.lat);
    if (userLocation?.lng != null) params.set("longitude", userLocation.lng);
    if (serviceType !== "all") params.set("filters[service]", serviceType);
    if (maxDistance != null) params.set("filters[max_distance]", maxDistance);
    if (minRating > 0) params.set("filters[min_rating]", minRating);
    if (openNow) params.set("filters[open_now]", "true");
    if (search) params.set("search", search);
    if (city) params.set("filters[city]", city);
    
    // map frontend sort "recommended" to backend "highest_rated"
    let sortBy = "highest_rated";
    if (sort === "rating") sortBy = "highest_rated";
    else if (sort === "distance") sortBy = "nearest";
    params.set("sort_by", sortBy);

    return api.get(`${endpoints.discover}?${params.toString()}`, { signal }).then((res) => res.data);
  },

  searchServices: ({ q = "", category = "all", lat, lng, maxDistance = 50, locationArea = null } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    // Only send category if it's not the "all" sentinel
    if (category && category !== "all") params.set("category", category);
    if (lat != null) params.set("latitude", lat);
    if (lng != null) params.set("longitude", lng);
    // Map maxDistance to the nested filter the backend expects
    if (maxDistance != null && lat != null && lng != null) {
      params.set("filters[radius]", maxDistance);
    }
    // Named area filter (e.g. "Zamalek") — sent alongside coordinates if both exist
    if (locationArea) {
      params.set("filters[locations][]", locationArea);
    }

    return api
      .get(`${endpoints.services}/discover/search?${params.toString()}`)
      .then((res) => {
        const raw = res.data;
        // raw = { data: ServiceDiscoveryResponseDto[], meta: SearchMetaDto, filters: FilterCategoriesResponseDto }

        // ── Transform into shape useServiceSearch expects ──────────────────
        const groups = (raw.data ?? []).map((service) => ({
          serviceKey: service.service_id,
          serviceTitle: service.service_name,
          categoryName: service.category_name,
          providerCount: service.provider_count ?? service.total_offers ?? 0,
          minPriceLabel:
            service.from_price != null
              ? `EGP ${Math.round(service.from_price).toLocaleString("en-EG")}`
              : "—",
          offers: (service.offers ?? []).map((offer) => {
            const distKm = offer.distance_km;
            const distLabel =
              distKm != null && distKm > 0
                ? distKm < 1
                  ? `${Math.round(distKm * 1000)} M AWAY`
                  : `${distKm.toFixed(1)} KM AWAY`
                : null;

            return {
              provider: {
                id: offer.business_id,
                businessName: offer.business_name,
                address: offer.business_address,
                reviewCount: offer.total_reviews ?? 0,
                avgRating: offer.average_rating ?? 0,
                isOpen: offer.is_open ?? false,
                openLabel: offer.is_open
                  ? offer.operating_hours_today
                    ? `OPEN · ${offer.operating_hours_today}`
                    : "OPEN NOW"
                  : offer.operating_hours_today
                  ? `CLOSED · ${offer.operating_hours_today}`
                  : "CLOSED",
                // Used by formatProviderLocationLine
                distanceLabel: distLabel,
                distance: distKm,
              },
              // service.id here is business_service_id so the checkout path
              // gets the priced assignment, not the catalog service
              service: {
                id: offer.business_service_id,
                priceLabel:
                  offer.price != null
                    ? `EGP ${Math.round(offer.price).toLocaleString("en-EG")}`
                    : "—",
              },
              offerLine:
                offer.duration_minutes != null
                  ? `~${offer.duration_minutes} min`
                  : null,
            };
          }),
        }));

        // ── meta ──────────────────────────────────────────────────────────
        const meta = raw.meta
          ? {
              totalServices: raw.meta.total_services ?? 0,
              totalOffers: raw.meta.total_offers ?? 0,
              page: raw.meta.page ?? 1,
              totalPages: raw.meta.total_pages ?? 1,
            }
          : { totalServices: groups.length, totalOffers: 0 };

        // ── chips (category filter tabs) ──────────────────────────────────
        const chips = [
          ...(raw.filters?.categories ?? []).map((c) => ({
            id: c.name,
            label: c.name,
            count: c.count,
          })),
        ];

        // ── locations (merge with any API-provided location names) ────────
        const locations = (raw.filters?.locations ?? []).map((l) => ({
          id: l.name,
          label: l.name,
          count: l.count,
        }));

        return { groups, meta, chips, locations };
      });
  },

  providerDetails: (providerId, { userLocation = null } = {}) => {
    const params = new URLSearchParams();
    if (userLocation?.lat != null) params.set("lat", userLocation.lat);
    if (userLocation?.lng != null) params.set("lng", userLocation.lng);
    return api.get(`/businesses/${providerId}?${params.toString()}`).then((res) => res.data);
  },
};
