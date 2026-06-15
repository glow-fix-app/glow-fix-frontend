import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export const providerApi = {
  services: () => api.get(`${endpoints.provider}/services`).then((res) => res.data),
  bookings: () => api.get(`${endpoints.provider}/bookings`).then((res) => res.data),
  earnings: () => api.get(`${endpoints.provider}/earnings`).then((res) => res.data),
  reviews: () => api.get(`${endpoints.provider}/reviews`).then((res) => res.data),
  tracking: () => api.get(`${endpoints.provider}/tracking`).then((res) => res.data),
  
  // Real backend endpoints for dashboard
  myBusiness: () => api.get('/businesses/me').then((res) => res.data),
  stats: () => api.get('/businesses/me/stats').then((res) => res.data),
  
  // Analytics Module Endpoints
  analyticsDashboard: (params) => api.get('/analytics/dashboard', { params }).then(res => res.data),
  analyticsRevenue: (params) => api.get('/analytics/revenue', { params }).then(res => res.data),
  analyticsBookings: (params) => api.get('/analytics/bookings', { params }).then(res => res.data),
  analyticsTopServices: (params) => api.get('/analytics/bookings/top-services', { params }).then(res => res.data),
  managerBookings: (params) => api.get('/manager/bookings', { params }).then((res) => res.data),
  managerBookingDetails: (id) => api.get(`/manager/bookings/${id}`).then((res) => res.data),
  reviewBooking: (id, data) => api.patch(`/manager/bookings/${id}/review`, data).then((res) => res.data),
  updateBookingStatus: (id, data) => api.patch(`/manager/bookings/${id}/status`, data).then((res) => res.data),
  businessReviews: (businessId, params) => api.get(`/reviews/business/${businessId}`, { params }).then((res) => res.data),
  // Payouts & Earnings
  getPayouts: (businessId, params) => api.get(`/payments/business/${businessId}/payouts`, { params }).then(res => res.data),
  
  // Diagnostic Reports & Services
  getAssignedServices: (businessId) => api.get(`/services/business/${businessId}/assigned`).then(res => res.data),
  createDiagnosticReport: (data) => api.post('/diagnostic-reports', data).then(res => res.data),
  getDiagnosticReport: (bookingId) => api.get(`/diagnostic-reports/booking/${bookingId}`).then(res => res.data),

  // Service Management
  getUnassignedServices: (businessId) => api.get(`/services/business/${businessId}/unassigned`).then(res => res.data),
  assignService: (businessId, data) => api.post(`/services/business/${businessId}/assign`, data).then(res => res.data),
  updateAssignedService: (businessId, businessServiceId, data) => api.put(`/services/business/${businessId}/assigned/${businessServiceId}`, data).then(res => res.data),
  toggleAssignedService: (businessId, businessServiceId) => api.patch(`/services/business/${businessId}/assigned/${businessServiceId}/toggle`).then(res => res.data),
  deleteAssignedService: (businessId, businessServiceId) => api.delete(`/services/business/${businessId}/assigned/${businessServiceId}`).then(res => res.data),

  // Reviews Management
  getBusinessReviews: (businessId, params) => api.get(`/reviews/business/${businessId}`, { params }).then(res => res.data),
  getBusinessRatingSummary: (businessId) => api.get(`/reviews/business/${businessId}/summary`).then(res => res.data),
  replyToReview: (reviewId, reply) => api.post(`/reviews/${reviewId}/reply`, { reply }).then(res => res.data),

  // Profile Management
  updateProfile: (data) => api.put('/users/me', data).then((res) => res.data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/users/me/avatar', formData).then((res) => res.data);
  },
  deleteAvatar: () => api.delete('/users/me/avatar').then((res) => res.data),

  createBusiness: (data) => api.post('/businesses', data).then((res) => res.data),
  updateBusiness: (data) => api.put('/businesses/me', data).then((res) => res.data),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put('/businesses/me/logo', formData).then((res) => res.data);
  },
  uploadCover: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put('/businesses/me/cover', formData).then((res) => res.data);
  },
  uploadGalleryImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/businesses/me/gallery', formData).then((res) => res.data);
  },
  deleteGalleryImage: (url) => api.delete('/businesses/me/gallery', { data: { url } }).then((res) => res.data),
  reorderGallery: (urls) => api.put('/businesses/me/gallery/reorder', { urls }).then((res) => res.data),

  // Document Management
  getDocuments: () => api.get('/businesses/me/documents').then((res) => res.data),
  uploadDocument: (file, type) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return api.post('/businesses/me/documents', formData).then((res) => res.data);
  },
  deleteDocument: (documentId) => api.delete(`/businesses/me/documents/${documentId}`).then((res) => res.data),
};
