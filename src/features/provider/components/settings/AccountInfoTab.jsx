import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { providerApi } from "../../services/providerApi";
import { setCurrentUser } from "@/store/slices/authSlice";
import { Button, Card, toast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function AccountInfoTab() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const updateMutation = useMutation({
    mutationFn: (data) => providerApi.updateProfile({ full_name: data.name, phone: data.phone }),
    onSuccess: (_, variables) => {
      dispatch(setCurrentUser({ ...user, full_name: variables.name, phone: variables.phone }));
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update profile.";
      toast.danger(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: user?.full_name || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await providerApi.uploadAvatar(file);
      if (data?.url) {
        dispatch(setCurrentUser({ ...user, avatar_url: data.url }));
      } else if (data?.user) {
        dispatch(setCurrentUser(data.user));
      }
      toast.success("Avatar updated successfully!");
    } catch {
      toast.danger("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      await providerApi.deleteAvatar();
      dispatch(setCurrentUser({ ...user, avatar_url: null }));
      toast.success("Avatar removed!");
    } catch {
      toast.danger("Failed to remove avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = user?.full_name || user?.name || "Your Name";
  const displayEmail = user?.email || "";

  return (
    <div className="space-y-5">
      {/* ── Avatar Hero ──────────────────────────────────────────────────── */}
      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Profile Summary
          </p>
        </header>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
              <UserAvatar
                user={user}
                className="h-20 w-20 text-xl rounded-xl ring-1 ring-black/5"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold text-text-primary">{displayName}</h2>
            <p className="mt-0.5 truncate text-[13px] text-text-tertiary">{displayEmail}</p>
            
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                className="h-8 rounded-lg bg-surface-hover px-3 text-[12px] font-semibold text-text-secondary hover:bg-gray-200"
                onPress={() => fileInputRef.current?.click()}
                isLoading={isUploading}
              >
                Change picture
              </Button>
              {user?.avatar_url && (
                <Button
                  size="sm"
                  variant="light"
                  className="h-8 rounded-lg px-3 text-[12px] font-semibold text-red-500 hover:bg-red-50"
                  onPress={handleDeleteAvatar}
                  isDisabled={isUploading}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Personal Details ─────────────────────────────────────────────── */}
      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Personal Details
          </p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput
              label="Full Name"
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 5, message: "Name must be at least 5 characters long" },
                pattern: {
                  value: /^[\p{L}\u0600-\u06FF]+\s+[\p{L}\u0600-\u06FF\s]+$/u,
                  message: "Please enter your first and last name"
                }
              })}
              placeholder="Enter your first and last name"
              error={errors.name?.message}
            />
            <FormInput
              label="Email"
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              error={errors.email?.message}
              disabled
            />
          </div>

          <div className="max-w-sm">
            <FormInput
              label="Phone"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^(010|011|012|015)\d{8}$/,
                  message: "Enter a valid 11-digit Egyptian mobile number (e.g. 01012345678)"
                }
              })}
              placeholder="Enter phone number"
              error={errors.phone?.message}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[12px] text-text-muted">
              {isDirty ? "You have unsaved changes." : "All changes are saved."}
            </p>
            <Button
              type="submit"
              isDisabled={!isDirty}
              isLoading={updateMutation.isPending}
              className="h-9 rounded-xl bg-brand-500 px-6 text-[13px] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
