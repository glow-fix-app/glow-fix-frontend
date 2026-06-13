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
  managerBookings: (params) => api.get('/manager/bookings', { params }).then((res) => res.data),
  managerBookingDetails: (id) => api.get(`/manager/bookings/${id}`).then((res) => res.data),
  reviewBooking: (id, data) => api.patch(`/manager/bookings/${id}/review`, data).then((res) => res.data),
  updateBookingStatus: (id, data) => api.patch(`/manager/bookings/${id}/status`, data).then((res) => res.data),
  businessReviews: (businessId, params) => api.get(`/reviews/business/${businessId}`, { params }).then((res) => res.data),
  
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
};
