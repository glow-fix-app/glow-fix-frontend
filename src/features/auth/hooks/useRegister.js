import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/authApi";

export function useRegister() {
  return useMutation({
    mutationFn: (payload) => {
      if (payload.role === "manager") {
        const formData = new FormData();
        formData.append("fullName", payload.fullName);
        formData.append("email", payload.email);
        if (payload.phone) {
          formData.append("phone", payload.phone);
        }
        formData.append("password", payload.password);
        formData.append("confirmPassword", payload.confirmPassword);
        formData.append("businessName", payload.businessName);
        formData.append("address", payload.address);

        if (payload.branchLocation) {
          formData.append("latitude", payload.branchLocation.lat);
          formData.append("longitude", payload.branchLocation.lng);
        }

        if (payload.businessRegistration?.[0]) {
          formData.append("businessRegistration", payload.businessRegistration[0]);
        }
        if (payload.ownerID?.[0]) {
          formData.append("ownerID", payload.ownerID[0]);
        }
        if (payload.insuranceCertificate?.[0]) {
          formData.append("insuranceCertificate", payload.insuranceCertificate[0]);
        }
        if (payload.serviceLicense?.[0]) {
          formData.append("serviceLicense", payload.serviceLicense[0]);
        }

        return authApi.registerManager(formData);
      }

      const body = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      };
      return authApi.registerClient(body);
    },
  });
}
