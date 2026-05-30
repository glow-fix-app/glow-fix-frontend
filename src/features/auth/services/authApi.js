import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

function mapSession(session) {
  return {
    id: session.id,
    device: session.deviceInfo || "Unknown device",
    location: session.ipAddress || "Unknown location",
    isCurrent: Boolean(session.isCurrent),
    lastActive: session.lastUsedAt || session.createdAt,
  };
}

export const authApi = {
  async login({ email, password }) {
    const res = await api.post(endpoints.auth.login, {
      identifier: email,
      password,
    });
    return res.data;
  },

  async registerClient(payload) {
    const res = await api.post(endpoints.auth.registerClient, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || undefined,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });
    return res.data;
  },

  async registerManager(payload) {
    const res = await api.post(endpoints.auth.registerManager, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || undefined,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });
    return res.data;
  },

  async verifyOtp(payload) {
    const res = await api.post(endpoints.auth.verifyOtp, payload);
    return res.data;
  },

  async resendOtp(payload) {
    const res = await api.post(endpoints.auth.resendOtp, payload);
    return res.data;
  },

  async refresh() {
    const res = await api.post(endpoints.auth.refresh);
    return res.data;
  },

  async validateMfa({ mfaToken, code }) {
    const res = await api.post(endpoints.auth.mfaValidate, { mfaToken, code });
    return res.data;
  },

  async currentUser() {
    const res = await api.get(endpoints.users.me);
    return res.data;
  },

  async logout() {
    const res = await api.post(endpoints.auth.logout);
    return res.data;
  },

  async logoutAll() {
    const res = await api.post(endpoints.auth.logoutAll);
    return res.data;
  },

  async getSessions() {
    const res = await api.get(endpoints.auth.sessions);
    const sessions = Array.isArray(res.data) ? res.data : [];
    return sessions.map(mapSession);
  },

  async deleteSession(sessionId) {
    const res = await api.delete(`${endpoints.auth.sessions}/${sessionId}`);
    return res.data;
  },

  async changePassword(payload) {
    const res = await api.post(endpoints.auth.changePassword, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword ?? payload.newPassword,
    });
    return res.data;
  },

  async forgotPassword(payload) {
    const res = await api.post(endpoints.auth.forgotPassword, payload);
    return res.data;
  },

  async verifyResetOtp(payload) {
    const res = await api.post(endpoints.auth.verifyResetOtp, payload);
    return res.data;
  },

  async resetPassword(payload) {
    const res = await api.post(endpoints.auth.resetPassword, {
      resetToken: payload.resetToken,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    });
    return res.data;
  },
};
