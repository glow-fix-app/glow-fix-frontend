/**
 * NestJS API wraps successes as `{ success: true, data }` and errors as `{ success: false, error }`.
 */

export function unwrapApiData(payload) {
  if (payload && typeof payload === "object" && payload.success === true && "data" in payload) {
    return payload.data;
  }
  return payload;
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.error?.message) return data.error.message;
  if (data.message) {
    return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return fallback;
}
