import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "@heroui/react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FormField } from "@/features/auth/components/FormField";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { authApi } from "@/features/auth/services/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { getSafeAuthRedirectPath } from "@/features/auth/utils/authRedirect";
import { mapApiRole } from "@/features/auth/constants/roles";
import { getApiErrorMessage } from "@/services/apiResponse";

export default function MfaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mfaToken = location.state?.mfaToken;

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!mfaToken) {
      navigate("/auth/login", { replace: true });
    }
  }, [mfaToken, navigate]);

  if (!mfaToken) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await authApi.validateMfa({ mfaToken, code });
      dispatch(setCredentials(data));
      const role = mapApiRole(data?.user?.role);
      navigate(getSafeAuthRedirectPath(role), { replace: true });
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Invalid authentication code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <AuthHeader
        title="Two-factor authentication"
        description="Enter the 6-digit code from your authenticator app."
      />
      <FormField
        id="mfa-code"
        label="Authentication code"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <SubmitButton isLoading={isSubmitting}>Continue</SubmitButton>
    </form>
  );
}
