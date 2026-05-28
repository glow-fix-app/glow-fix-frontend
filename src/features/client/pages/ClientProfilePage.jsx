import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Card, toast } from "@heroui/react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";
import { useUpdateProfile } from "@/features/client/hooks/useProfile";
import { clientApi } from "@/features/client/services/clientApi";
import { setCurrentUser } from "@/store/slices/authSlice";
import { CameraIcon } from "@heroicons/react/24/outline";

export default function ClientProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(
    user?.phone_verified ? "verified" : "unverified"
  );
  const fileInputRef = useRef(null);

  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
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
    updateMutation.mutate({ full_name: data.name, phone: data.phone });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await clientApi.uploadAvatar(file);
      if (data?.url) {
        dispatch(setCurrentUser({ ...user, avatarUrl: data.url }));
      } else if (data?.user) {
        dispatch(setCurrentUser(data.user));
      } else {
        const profile = await clientApi.profile();
        dispatch(setCurrentUser(profile));
      }
      toast.success("Avatar updated!");
    } catch {
      toast.danger("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleVerify = () => {
    setVerificationStatus("verifying");
    setTimeout(() => setVerificationStatus("verified"), 1500);
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
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 ring-2 ring-white disabled:opacity-50"
              >
                <CameraIcon className="h-3.5 w-3.5 text-white" />
              </button>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold text-text-primary">{displayName}</h2>
            <p className="mt-0.5 truncate text-[13px] text-text-tertiary">{displayEmail}</p>
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
                minLength: { value: 3, message: "Name must be at least 3 characters long" },
                pattern: {
                  value: /^[a-zA-Z\s\u0600-\u06FF]+$/,
                  message: "Name can only contain letters and spaces"
                }
              })}
              placeholder="Enter your name"
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
                  value: /^(\+20|0)?1[0125]\d{8}$/,
                  message: "Enter a valid Egyptian mobile number (e.g., 01xxxxxxxxx)"
                }
              })}
              placeholder="Enter phone number"
              error={errors.phone?.message}
              endContent={
                verificationStatus === "verified" ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verificationStatus === "verifying"}
                    className="text-[11px] font-bold uppercase tracking-wider text-blue-500 disabled:opacity-50"
                  >
                    {verificationStatus === "verifying" ? "Verifying..." : "Verify"}
                  </button>
                )
              }
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

      {/* end of profile page content */}
    </div>
  );
}
