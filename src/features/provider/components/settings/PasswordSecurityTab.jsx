import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../auth/services/authApi";
import { Link } from "react-router-dom";
import { Button, Card, Spinner, toast } from "@heroui/react";
import { ComputerDesktopIcon, DevicePhoneMobileIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useForm } from "react-hook-form";

export default function PasswordSecurityTab() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: authApi.getSessions,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update password.";
      toast.danger(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const logoutSessionMutation = useMutation({
    mutationFn: (sessionId) => authApi.deleteSession(sessionId),
    onSuccess: () => {
      toast.success("Session logged out successfully.");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to logout session.";
      toast.danger(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  const getDeviceIcon = (deviceStr) => {
    const lower = deviceStr?.toLowerCase() || "";
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return <DevicePhoneMobileIcon className="w-5 h-5 text-gray-500" />;
    }
    return <ComputerDesktopIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="md:hidden mb-4">
        <Button 
          as={Link}
          to="/provider/settings"
          variant="light" 
          className="text-gray-500 font-medium px-0 gap-1 -ml-2"
          startContent={<span className="text-xl leading-none">←</span>}
        >
          Back to Settings
        </Button>
      </div>

      <Card className="border-none p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Change Password</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              {...register("currentPassword", { required: "Current password is required" })}
              error={errors.currentPassword?.message}
            />
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              {...register("newPassword", { 
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
              error={errors.newPassword?.message}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              {...register("confirmPassword", { 
                required: "Please confirm your new password",
                validate: value => value === newPasswordValue || "Passwords do not match"
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="h-9 rounded-lg bg-brand-500 px-6 text-[12px] font-semibold text-white transition-all hover:bg-brand-600 cursor-pointer"
              isLoading={changePasswordMutation.isPending}
            >
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-none p-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-text-primary">Active Sessions</h2>
          <p className="text-[13px] text-text-secondary mt-1">Manage the devices you are currently logged in on.</p>
        </div>
        <div className="flex flex-col">
          {isLoadingSessions ? (
            <div className="p-8 flex justify-center">
              <Spinner size="md" color="primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-[14px] text-text-secondary">No active sessions found.</div>
          ) : (
            sessions.map((session, index) => (
              <div 
                key={session.id} 
                className={`flex items-center justify-between px-8 py-5 ${index !== sessions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-gray-200">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-text-primary">{session.device}</p>
                    <p className="text-[12px] text-text-secondary mt-0.5">{session.location}</p>
                  </div>
                </div>
                <div>
                  {session.isCurrent ? (
                    <span className="text-[11px] font-bold tracking-wider text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase">
                      Current
                    </span>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="danger" 
                      className="text-[12px] font-bold rounded-lg px-4 h-9 bg-red-50 text-red-600 hover:bg-red-100"
                      isLoading={logoutSessionMutation.isPending && logoutSessionMutation.variables === session.id}
                      onPress={() => logoutSessionMutation.mutate(session.id)}
                      startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                    >
                      Log out
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
