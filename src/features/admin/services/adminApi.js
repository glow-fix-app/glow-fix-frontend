import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const adminApi = {
  // Dashboard
  dashboardStats: () => api.get(`${endpoints.admin}/dashboard/stats`).then((res) => res.data),
  dashboardRevenue: (params) => api.get(`${endpoints.admin}/dashboard/revenue`, { params }).then((res) => res.data),
  dashboardTopPerformers: (params) => api.get(`${endpoints.admin}/dashboard/top-performers`, { params }).then((res) => res.data),
  dashboardHealth: () => api.get(`${endpoints.admin}/dashboard/health`).then((res) => res.data),

  // Users & Businesses
  users: (params) => api.get(`${endpoints.admin}/users`, { params }).then((res) => res.data),
  userById: (id) => api.get(`${endpoints.admin}/users/${id}`).then((res) => res.data),
  createUser: (data) => api.post(`${endpoints.admin}/users`, data).then((res) => res.data),
  userBookings: (id, params) => api.get(`${endpoints.admin}/bookings/user/${id}`, { params }).then((res) => res.data),
  businesses: (params) => api.get(`${endpoints.admin}/businesses`, { params }).then((res) => res.data),
  businessById: (id) => api.get(`${endpoints.admin}/businesses/${id}`).then((res) => res.data),
  updateBusiness: (id, data) => api.put(`${endpoints.admin}/businesses/${id}`, data).then((res) => res.data),
  businessBookings: (id, params) => api.get(`${endpoints.admin}/businesses/${id}/bookings`, { params }).then((res) => res.data),
  businessReviews: (id, params) => api.get(`${endpoints.admin}/businesses/${id}/reviews`, { params }).then((res) => res.data),
  approveBusiness: (id, data) => api.post(`${endpoints.admin}/businesses/${id}/approve`, data).then((res) => res.data),
  rejectBusiness: (id, data) => api.post(`${endpoints.admin}/businesses/${id}/reject`, data).then((res) => res.data),
  approveDocument: (businessId, documentId) => api.post(`${endpoints.admin}/businesses/${businessId}/documents/${documentId}/approve`).then((res) => res.data),
  rejectDocument: (businessId, documentId) => api.post(`${endpoints.admin}/businesses/${businessId}/documents/${documentId}/reject`).then((res) => res.data),

  // Bookings
  bookings: (params) => api.get(`${endpoints.admin}/bookings`, { params }).then((res) => res.data),

  // Reviews
  reviews: (params) => api.get(`${endpoints.admin}/reviews`, { params }).then((res) => res.data),

  // Payments & Payouts
  payments: (params) => api.get(`${endpoints.admin}/payments`, { params }).then((res) => res.data),
  payouts: (params) => api.get(`${endpoints.admin}/payouts`, { params }).then((res) => res.data),
  processPayout: (id, data) => api.post(`${endpoints.admin}/payouts/${id}/process`, data).then((res) => res.data),

  // Analytics
  analyticsDashboard: (params) => api.get('/analytics/dashboard', { params }).then(res => res.data),
  analyticsRevenue: (params) => api.get('/analytics/revenue', { params }).then(res => res.data),
  analyticsRevenueSummary: (params) => api.get('/analytics/revenue/summary', { params }).then(res => res.data),
  analyticsPaymentMethods: (params) => api.get('/analytics/revenue/payment-methods', { params }).then(res => res.data),
  analyticsBookings: (params) => api.get('/analytics/bookings', { params }).then(res => res.data),
  analyticsTopServices: (params) => api.get('/analytics/bookings/top-services', { params }).then(res => res.data),
  analyticsBusinesses: (params) => api.get('/analytics/businesses', { params }).then(res => res.data),

  // Settings
  settings: () => api.get(`${endpoints.admin}/settings`).then(res => res.data),
  updateSettings: (data) => api.put(`${endpoints.admin}/settings`, data).then(res => res.data),

  // Legacy aliases (to not break existing UI temporarily)
  clients: (params) => api.get(`${endpoints.admin}/users`, { params: { ...params, role: 'CLIENT' } }).then((res) => res.data),
  providers: (params) => api.get(`${endpoints.admin}/businesses`, { params }).then((res) => res.data),
};
