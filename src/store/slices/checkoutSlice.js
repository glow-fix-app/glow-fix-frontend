import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  /** Shown on /checkout/:id/confirmed until user leaves */
  successBooking: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutSuccessBooking(state, action) {
      state.successBooking = action.payload;
    },
    resetCheckout() {
      return { ...initialState };
    },
  },
});

export const { setCheckoutSuccessBooking, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;

// ─── Pure helpers (single module; used by checkout UI + provider navigation) ─

export const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function parsePriceFromLabel(priceLabel) {
  if (!priceLabel || priceLabel === "Free") return 0;
  const match = String(priceLabel).match(/[\d.]+/);
  if (!match) return 0;
  return parseFloat(match[0]);
}

export function normalizeCheckoutService(service, categoryName = "") {
  return {
    id: service.id,
    name: service.name || service.title || "Service",
    priceLabel: service.priceLabel || "",
    price: service.price ?? parsePriceFromLabel(service.priceLabel),
    category: categoryName || service.category || "",
  };
}

export function flattenProviderServices(serviceCategories = []) {
  return serviceCategories.flatMap((category) =>
    (category.services || []).map((service) =>
      normalizeCheckoutService(service, category.title || category.name)
    )
  );
}

export function resolveCheckoutServices(provider, serviceIds) {
  if (!provider || !serviceIds?.length) return [];
  const catalog = flattenProviderServices(provider.serviceCategories);
  const idSet = new Set(serviceIds.map(String));
  return catalog.filter((service) => idSet.has(String(service.id)));
}

export function buildCheckoutPath(providerId, serviceIds) {
  const params = new URLSearchParams();
  if (serviceIds?.length) params.set("services", serviceIds.join(","));
  const q = params.toString();
  return q ? `/checkout/${providerId}?${q}` : `/checkout/${providerId}`;
}

export function parseServiceIds(searchParams) {
  const raw = searchParams.get("services");
  if (!raw) return [];
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

/** Same IDs as parseServiceIds, but keyed only by the raw query value (stable string dep). */
export function parseServicesParam(rawServices) {
  if (!rawServices) return [];
  return rawServices.split(",").map((id) => id.trim()).filter(Boolean);
}

/** Keeps wizard step bookmarkable/shareable across remounts. */
export const CHECKOUT_FLOW_PARAM = "checkoutFlow";
export const CHECKOUT_FLOW_REVIEW = "review";

/** Survive dev full reload that can clear Redux mid-flow. Cleared when starting checkout or leaving confirmed. */
const CHECKOUT_CONFIRMED_SNAPSHOT_PREFIX = "bookingConfirmedSnapshot:";

export function persistCheckoutConfirmedSnapshot(providerId, booking) {
  if (!providerId || !booking) return;
  try {
    sessionStorage.setItem(`${CHECKOUT_CONFIRMED_SNAPSHOT_PREFIX}${providerId}`, JSON.stringify(booking));
  } catch (_) {
    /* quota / privacy mode */
  }
}

export function readCheckoutConfirmedSnapshot(providerId) {
  if (!providerId) return null;
  try {
    const raw = sessionStorage.getItem(`${CHECKOUT_CONFIRMED_SNAPSHOT_PREFIX}${providerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutConfirmedSnapshot(providerId) {
  if (!providerId) return;
  try {
    sessionStorage.removeItem(`${CHECKOUT_CONFIRMED_SNAPSHOT_PREFIX}${providerId}`);
  } catch {
    /* ignore */
  }
}

export function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDateLabel(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

export function buildScheduledAt(date, time) {
  const [h, m] = time.split(":");
  const d = new Date(date);
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toISOString();
}

export function formatPrice(price) {
  const pounds = Number(price) || 0;
  if (pounds <= 0) return "Free";
  return Number.isInteger(pounds)
    ? `EGP ${pounds}`
    : `EGP ${pounds.toFixed(2)}`;
}

export function getAvailableDays(operatingHours) {
  if (!operatingHours?.length) return getNext7Days();
  const days = [];
  const today = new Date();
  let i = 0;
  while (days.length < 7 && i < 30) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();
    const oh = operatingHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (oh && !oh.isClosed) days.push(d);
    i++;
  }
  return days;
}

export function generateTimeSlots(openTime, closeTime) {
  if (!openTime || !closeTime) return [];
  const slots = [];
  const [startH, startM] = openTime.split(":").map(Number);
  const [endH, endM] = closeTime.split(":").map(Number);
  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  while (currentMin <= endMin) {
    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    currentMin += 30;
  }
  return slots;
}
