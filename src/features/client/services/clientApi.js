import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const clientApi = {
  // Services
  services: () => api.get(endpoints.services).then((res) => res.data),
  serviceDetails: (id) => api.get(`${endpoints.services}/${id}`).then((res) => res.data),
  categories: () => api.get(endpoints.categories).then((res) => res.data),

  // Bookings
  bookings: ({ page = 1, limit = 20, status } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    return api.get(`${endpoints.bookings}?${params.toString()}`).then((res) => res.data);
  },
  bookingDetails: (id) =>
    api.get(`${endpoints.bookings}/${id}`).then((res) => res.data),
  cancelBooking: (id, reason) =>
    api.patch(`${endpoints.bookings}/${id}/cancel`, { reason: reason ?? "Cancelled by client" }).then((res) => res.data),
  rescheduleBooking: (id, scheduledAt) =>
    api.patch(`${endpoints.bookings}/${id}/reschedule`, { scheduledAt }).then((res) => res.data),
  reportDetails: async (reportId) => {
    return api.get(`${endpoints.diagnosticReports}/${reportId}`).then((res) => res.data);
  },
  payBooking: (data) =>
    api.post(endpoints.payments, {
      booking_id: data.booking_id,
      payment_method: data.payment_method || "CARD",
      redeem_points: data.redeem_points,
      points_to_redeem: data.points_to_redeem,
    }).then((res) => res.data),
  confirmPayment: (paymentIntentId) =>
    api.post(`${endpoints.payments}/confirm`, { payment_intent_id: paymentIntentId }).then((res) => res.data),

  /**
   * uploadBookingImages — uploads image Files to Cloudflare R2 via the backend.
   * Returns an array of objects containing url and storageKey.
   * @param {File[]} files - array of File objects from the photo picker
   */
  uploadBookingImages: async (files) => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file);
    }
    const res = await api.post(`${endpoints.bookings}/upload-images`, formData, {
      // Let browser set multipart boundary automatically
    });
    return res.data.images ?? [];
  },

  /**
   * createBooking — transforms the checkout payload into the backend DTO.
   * @param {object} data
   * @param {string}   data.businessId       - the provider/business UUID
   * @param {string}   data.vehicleId        - the client vehicle UUID
   * @param {{businessServiceId: string}[]} data.items - service line items
   * @param {string}   data.scheduledAt      - ISO-8601 datetime string
   * @param {string}   [data.note]           - optional client note
   * @param {string[]} [data.images]         - optional problem photo URLs
   */
  createBooking: (data) =>
    api.post(`${endpoints.bookings}`, {
      businessId: data.businessId,
      vehicleId: data.vehicleId,
      items: Array.isArray(data.items)
        ? data.items
        : (data.serviceIds ?? []).map((id) => ({ businessServiceId: id })),
      scheduledAt: data.scheduledAt,
      note: data.note ?? data.notes ?? undefined,
      images: data.images ?? [],
    }).then((res) => res.data),

  // Vehicles
  vehicles: () => api.get(endpoints.vehicles).then((res) => res.data),
  addVehicle: (data) => api.post(endpoints.vehicles, data).then((res) => res.data),
  updateVehicle: (id, data) => api.put(`${endpoints.vehicles}/${id}`, data).then((res) => res.data),
  deleteVehicle: (id) => api.delete(`${endpoints.vehicles}/${id}`).then((res) => res.data),

  // Payments & Billing
  billingSummary: () =>
    api.get(`/clients/me/stats`).then((res) => ({
      spentThisMonth: res.data.total_spent,
      totalRefunded: res.data.total_refunded,
      bookings: res.data.total_bookings,
      loyaltyPointsEarned: res.data.loyalty_points,
      currency: "EGP", // Backend defaults to EGP
    })),
  payments: ({ page = 1, limit = 5 } = {}) =>
    api.get(`/payments?page=${page}&limit=${limit}`)
      .then((res) => ({
        data: res.data.data,
        totalCount: res.data.meta?.total ?? 0,
      })),
  paymentDetails: (id) => api.get(`/payments/${id}`).then((res) => res.data),

  // Reviews
  checkReview: (bookingId) =>
    api.get(`/reviews/check/${bookingId}`).then((res) => res.data),
  createReview: (data) =>
    api.post(`/reviews`, data).then((res) => res.data),
  getBookingReview: (bookingId) =>
    api.get(`/reviews/booking/${bookingId}`).then((res) => res.data),

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
    categories = [],
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
    if (categories && categories.length > 0) {
      categories.forEach(c => params.append("filters[categories][]", c));
    }
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
                logoUrl: offer.business_logo,
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

  providerDetails: async (providerId, { userLocation = null } = {}) => {
    const params = new URLSearchParams();
    if (userLocation?.lat != null) params.set("lat", userLocation.lat);
    if (userLocation?.lng != null) params.set("lng", userLocation.lng);

    const [business, services, reviewsData] = await Promise.all([
      api.get(`/businesses/details/${providerId}?${params.toString()}`).then((res) => res.data),
      api.get(`${endpoints.services}/business/${providerId}`).then((res) => res.data).catch(() => []),
      api.get(`/reviews/business/${providerId}`).then((res) => res.data).catch(() => null),
    ]);

    const categoriesMap = {};
    for (const s of services) {
      if (!categoriesMap[s.category_name]) {
        categoriesMap[s.category_name] = { 
          name: s.category_name, 
          title: s.category_name, 
          services: [] 
        };
      }
      categoriesMap[s.category_name].services.push({
        id: s.business_service_id,
        name: s.title,
        price: s.price,
        priceLabel: s.price != null ? `EGP ${s.price}` : "Free",
        duration: s.duration_minutes,
        durationLabel: s.duration_minutes != null ? `~${s.duration_minutes} min` : null,
        category: s.category_name,
      });
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formattedHours = (business.operating_hours || []).map((h) => ({
      dayOfWeek: h.dayOfWeek,
      dayName: dayNames[h.dayOfWeek] || `Day ${h.dayOfWeek}`,
      isClosed: h.openTime == null || h.closeTime == null,
      openTime: h.openTime ? h.openTime.slice(0, 5) : "",
      closeTime: h.closeTime ? h.closeTime.slice(0, 5) : "",
    }));

    const categoryNames = Object.keys(categoriesMap);
    let typeLabel = "Automotive Services";
    if (categoryNames.includes("Wash") && (categoryNames.includes("Repair") || categoryNames.includes("Diagnostics"))) {
      typeLabel = "Car Wash & Repair Shop";
    } else if (categoryNames.includes("Wash")) {
      typeLabel = "Car Wash & Detailing";
    } else if (categoryNames.includes("Repair") || categoryNames.includes("Diagnostics")) {
      typeLabel = "Auto Repair & Maintenance";
    }

    const about = {
      address: business.address,
      phone: business.contact_phone || business.contactPhone,
      email: business.contact_email || business.contactEmail,
      description: business.description,
      typeLabel,
    };

    const gallery = (business.gallery && business.gallery.length > 0)
      ? business.gallery
      : [
          "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=600&q=80",
        ];

    const reviews = (reviewsData?.reviews ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      qualityRating: r.quality_rating,
      punctualityRating: r.punctuality_rating,
      communicationRating: r.communication_rating,
      comment: r.comment,
      reply: r.reply,
      repliedAt: r.replied_at,
      createdAt: r.created_at || r.createdAt,
      authorName: r.client_name || "Anonymous Client",
      authorAvatar: null,
    }));

    return {
      ...business,
      lat: business.latitude,
      lng: business.longitude,
      businessName: business.business_name || business.businessName,
      coverUrl: business.cover_url || business.coverUrl,
      logoUrl: business.logo_url || business.logoUrl,
      serviceCategories: Object.values(categoriesMap),
      operatingHours: formattedHours,
      about,
      gallery,
      reviews,
      avgRating: reviewsData?.average_rating ?? business.average_rating ?? 0,
      reviewCount: reviewsData?.total_reviews ?? business.total_reviews ?? 0,
    };
  },
};
