export function formatDateTime(dateStr, { uppercase = false } = {}) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const label = `${weekday}, ${month} ${day} · ${time}`;
    return uppercase ? label.toUpperCase() : label;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr, locale = "en-GB") {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
export function toPounds(value) {
  return Number(value) || 0;
}
export function formatEgp(amount) {
  return `EGP ${Math.round(toPounds(amount)).toLocaleString("en-EG")}`;
}
export function formatCurrency(amount, currency = "EGP", locale = "en-EG") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(toPounds(amount));
}
