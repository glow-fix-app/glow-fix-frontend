import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Card, toast } from "@heroui/react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";
import { useUpdateProfile } from "@/features/client/hooks/useProfile";
import { clientApi } from "@/features/client/services/clientApi";
import { setCurrentUser } from "@/store/slices/authSlice";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import LocationPicker from "@/components/ui/LocationPicker";

export default function ClientProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(
    user?.phone_verified ? "verified" : "unverified"
  );
  
  // Location state — initialize from redux user (may be null until hydrated)
  const [location, setLocation] = useState(
    user?.clientLocation
      ? { lat: user.clientLocation.latitude, lng: user.clientLocation.longitude }
      : null
  );
  const [isLocationDirty, setIsLocationDirty] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  // Track what the server says the city is
  const [cityLabel, setCityLabel] = useState(user?.clientLocation?.city ?? null);

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

  // Sync form fields AND location pin whenever the server profile arrives/changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Only update map pin from server data if user hasn't manually moved it
      if (!isLocationDirty && user.clientLocation) {
        setLocation({ lat: user.clientLocation.latitude, lng: user.clientLocation.longitude });
        setCityLabel(user.clientLocation.city ?? null);
      } else if (!isLocationDirty && !user.clientLocation) {
        setLocation(null);
        setCityLabel(null);
      }
    }
  }, [user, reset, isLocationDirty]);

  const onSubmit = (data) => {
    updateMutation.mutate({ full_name: data.name, phone: data.phone });
  };

  const handleSaveLocation = async () => {
    if (!location) return;
    try {
      setIsSavingLocation(true);
      const result = await clientApi.updateLocation({
        latitude: location.lat,
        longitude: location.lng,
      });
      const city = result?.location?.city ?? null;
      setCityLabel(city);
      dispatch(setCurrentUser({
        ...user,
        clientLocation: {
          latitude: location.lat,
          longitude: location.lng,
          city,
        },
      }));
      setIsLocationDirty(false);
      toast.success("Location updated successfully!");
    } catch (err) {
      toast.danger("Failed to update location. Please try again.");
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await clientApi.uploadAvatar(file);
      if (data?.url) {
        dispatch(setCurrentUser({ ...user, avatar_url: data.url }));
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

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      await clientApi.deleteAvatar();
      dispatch(setCurrentUser({ ...user, avatar_url: null }));
      toast.success("Avatar removed!");
    } catch {
      toast.danger("Failed to remove avatar.");
    } finally {
      setIsUploading(false);
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
                  value: /^\+?\d{7,15}$/,
                  message: "Enter a valid phone number with 7 to 15 digits"
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

      {/* ── Location Details ─────────────────────────────────────────────── */}
      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Location Details
          </p>
        </header>
        <div className="space-y-6">
          <div>
            {cityLabel ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] text-text-muted font-medium">Current location:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-0.5 text-[13px] font-semibold text-brand-600 ring-1 ring-brand-200">
                  📍 {cityLabel}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200">
                  ⚠ No location set
                </span>
              </div>
            )}
            <p className="text-[13px] text-text-secondary">
              Your default location is used to find and suggest the best service providers near you.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden ring-1 ring-black/5">
            <LocationPicker
              value={location}
              onChange={(newLoc) => {
                setLocation(newLoc);
                setIsLocationDirty(true);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[12px] text-text-muted">
              {isLocationDirty ? "You have unsaved location changes." : "Your location is up to date."}
            </p>
            <Button
              type="button"
              isDisabled={!isLocationDirty || !location}
              isLoading={isSavingLocation}
              onPress={handleSaveLocation}
              className="h-9 rounded-xl bg-brand-500 px-6 text-[13px] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            >
              {isSavingLocation ? "Saving..." : "Update location"}
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
