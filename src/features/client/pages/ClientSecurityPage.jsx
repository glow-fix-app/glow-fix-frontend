import { Card, Button, Chip, toast } from "@heroui/react";
import { ComputerDesktopIcon, ArrowRightStartOnRectangleIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/FormInput";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { clientApi } from "@/features/client/services/clientApi";
import { authApi } from "@/features/auth/services/authApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "@/store/slices/authSlice";
import { queryKeys } from "@/services/queryClient";
import { getApiErrorMessage } from "@/services/apiResponse";
import { changePasswordSchema } from "@/features/auth/validation/authSchemas";
import { ROUTE_PATHS } from "@/routes/paths";
import EmptyState from "@/components/feedback/EmptyState";

export default function ClientSecurityPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const updatePasswordMutation = useMutation({
    mutationFn: clientApi.updateSecurity,
    onSuccess: (data) => {
      toast.success(data?.message || "Password updated. Please sign in again.");
      reset();
      // Backend revokes every session after a password change.
      dispatch(clearCredentials({ explicitLogout: true }));
      navigate(ROUTE_PATHS.AUTH_LOGIN, {
        replace: true,
        state: {
          message:
            data?.message ||
            "Password changed successfully. Sign in with your new password.",
        },
      });
    },
    onError: (err) => {
      toast.danger(getApiErrorMessage(err, "Failed to update password."));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearCredentials({ explicitLogout: true }));
      window.location.href = ROUTE_PATHS.AUTH_LOGIN;
    },
    onError: () => {
      toast.danger("Failed to sign out.");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      dispatch(clearCredentials({ explicitLogout: true }));
      window.location.href = ROUTE_PATHS.AUTH_LOGIN;
    },
    onError: () => {
      toast.danger("Failed to sign out from all devices.");
    },
  });

  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError, error: sessionsErrorObj, refetch: refetchSessions } = useQuery({
    queryKey: queryKeys.authSessions,
    queryFn: authApi.getSessions,
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: authApi.deleteSession,
    onSuccess: (_, deletedId) => {
      const isCurrent = sessions?.find((s) => s.id === deletedId)?.isCurrent;
      if (isCurrent) {
        dispatch(clearCredentials({ explicitLogout: true }));
        window.location.href = ROUTE_PATHS.AUTH_LOGIN;
      } else {
        toast.success("Session removed");
        refetchSessions();
      }
    },
    onError: () => {
      toast.danger("Failed to remove session.");
    },
  });

  const onSubmit = (data) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Security</p>
        <h1 className="text-xl font-semibold text-text-primary">Account security</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          You can stay signed in on up to 5 browsers or devices at the same time. Changing your password signs you out everywhere.
        </p>
      </header>

      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Change Password</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
          <Button
            type="submit"
            isLoading={updatePasswordMutation.isPending}
            className="h-11 rounded-xl bg-brand-500 px-8 text-[13px] font-semibold text-white transition-all hover:bg-brand-600"
          >
            Update password
          </Button>
        </form>
      </Card>

      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Active Sessions</p>
        </header>
        {sessionsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : sessionsError ? (
          <div className="flex h-32 items-center justify-center">
            <EmptyState
              icon={ShieldExclamationIcon}
              title="Could not load sessions"
              message={getApiErrorMessage(sessionsErrorObj, "Failed to load active sessions.")}
              action={
                <Button
                  variant="flat"
                  className="h-9 rounded-xl px-5 text-[12px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onPress={() => refetchSessions()}
                >
                  Retry
                </Button>
              }
            />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <EmptyState
              icon={ComputerDesktopIcon}
              title="No active sessions"
              message="You are not signed in on any other device."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-5 first:pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-hover ring-1 ring-black/5">
                    <ComputerDesktopIcon className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-text-primary">
                        {session.device} · {session.location}
                      </h4>
                      {session.isCurrent && (
                        <Chip color="success" variant="flat" size="sm" className="bg-emerald-100 text-[9px] font-semibold text-emerald-700 h-5">
                          CURRENT
                        </Chip>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      {session.isCurrent ? "Active now" : `Last active: ${new Date(session.lastActive).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="flat"
                  className="h-8 rounded-lg px-4 text-[12px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  isLoading={deleteSessionMutation.isPending && deleteSessionMutation.variables === session.id}
                  onPress={() => deleteSessionMutation.mutate(session.id)}
                >
                  Sign out
                </Button>
              </div>
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
            <Button
              variant="flat"
              className="h-10 rounded-xl px-6 text-[13px] font-semibold bg-red-50 text-red-600 hover:bg-red-100"
              startContent={<ArrowRightStartOnRectangleIcon className="h-4 w-4" />}
              isLoading={logoutAllMutation.isPending}
              onPress={() => logoutAllMutation.mutate()}
            >
              Sign out all devices
            </Button>
            <Button
              variant="flat"
              className="h-10 rounded-xl px-6 text-[13px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              isLoading={logoutMutation.isPending}
              onPress={() => logoutMutation.mutate()}
            >
              Sign out this device
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
