import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Button, 
  Card, 
  Spinner, 
  toast 
} from "@heroui/react";
import { 
  PhotoIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  GlobeAltIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

import LocationPicker from "@/components/ui/LocationPicker";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { providerApi } from "@/features/provider/services/providerApi";

export default function ProviderProfilePage() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleLogoClick = () => logoInputRef.current?.click();
  const handleCoverClick = () => coverInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  // 1. Fetch Business Details
  const { data: business, isLoading } = useQuery({
    queryKey: ["myBusiness"],
    queryFn: providerApi.myBusiness,
  });

  // 2. Form state (tied to live preview)
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    location: null, // { lat, lng }
  });

  // Sync state with backend data on load
  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.business_name || "",
        description: business.description || "",
        address: business.address || "",
        contactPhone: business.contact_phone || "",
        contactEmail: business.contact_email || "",
        location: business.latitude && business.longitude 
          ? { lat: business.latitude, lng: business.longitude }
          : null,
      });
    }
  }, [business]);

  // 3. Image upload & modify mutations
  const uploadLogoMutation = useMutation({
    mutationFn: providerApi.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Logo uploaded successfully!");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to upload logo.";
      toast.danger(errMsg);
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: providerApi.uploadCover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Cover photo uploaded successfully!");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to upload cover photo.";
      toast.danger(errMsg);
    },
  });

  const uploadGalleryMutation = useMutation({
    mutationFn: providerApi.uploadGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Image added to gallery!");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to upload gallery image.";
      toast.danger(errMsg);
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: providerApi.deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Gallery image deleted successfully.");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to delete gallery image.";
      toast.danger(errMsg);
    },
  });

  const reorderGalleryMutation = useMutation({
    mutationFn: providerApi.reorderGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Gallery order updated!");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to update gallery order.";
      toast.danger(errMsg);
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: (data) => business ? providerApi.updateBusiness(data) : providerApi.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      toast.success("Profile details saved successfully!");
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.message || "Failed to save profile.";
      toast.danger(errMsg);
    },
  });

  // File change handlers
  const handleLogoChange = (e) => {
    if (!business) {
      toast.danger("Please save your profile first before uploading a logo.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) uploadLogoMutation.mutate(file);
  };

  const handleCoverChange = (e) => {
    if (!business) {
      toast.danger("Please save your profile first before uploading a cover photo.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) uploadCoverMutation.mutate(file);
  };

  const handleGalleryChange = (e) => {
    if (!business) {
      toast.danger("Please save your profile first before adding gallery photos.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if ((business?.gallery?.length || 0) >= 10) {
        toast.danger("Maximum of 10 gallery photos is allowed.");
        return;
      }
      uploadGalleryMutation.mutate(file);
    }
  };

  // Reorder logic (Shift left / right)
  const handleMoveImage = (index, direction) => {
    if (!business?.gallery) return;
    const newGallery = [...business.gallery];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newGallery.length) return;
    
    // Swap elements
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;
    
    reorderGalleryMutation.mutate(newGallery);
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      toast.danger("Business name is required.");
      return;
    }
    if (!formData.address.trim()) {
      toast.danger("Address is required.");
      return;
    }
    if (!formData.location) {
      toast.danger("Please pick a location coordinates on the map.");
      return;
    }

    saveProfileMutation.mutate({
      business_name: formData.businessName,
      description: formData.description || null,
      address: formData.address,
      contact_phone: formData.contactPhone || null,
      contact_email: formData.contactEmail || null,
      location: {
        latitude: formData.location.lat,
        longitude: formData.location.lng,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">Loading business profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Customer Preview (Col 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[28px] bg-white overflow-hidden">
            {/* Cover photo banner */}
            <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
              {business?.cover_url ? (
                <img 
                  src={business.cover_url} 
                  alt="Business Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center justify-center">
                  <PhotoIcon className="h-10 w-10 text-gray-200" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-gray-400">No cover photo</span>
                </div>
              )}
            </div>

            {/* Identity details */}
            <div className="p-6 pt-0 relative flex flex-col items-start">
              {/* Business Logo Overlapping */}
              <div className="relative -mt-10 mb-4 rounded-2xl p-1 bg-white shadow-md">
                <UserAvatar 
                  user={{
                    name: formData.businessName || "Workshop Name",
                    avatar_url: business?.logo_url,
                  }}
                  radius="md"
                  bg="bg-brand-100 text-brand-600 font-bold"
                  className="h-20 w-20 text-xl border border-gray-100 rounded-xl"
                />
              </div>

              {/* Title & Location details */}
              <h3 className="text-lg font-bold text-text-primary">
                {formData.businessName || "Auto Care Workshop"}
              </h3>
              
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium mt-1">
                <MapPinIcon className="h-4 w-4 text-text-muted shrink-0" />
                <span className="truncate">{formData.address || "City, Area Address"}</span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs leading-relaxed text-text-secondary italic pr-2 border-l-2 border-brand-500/20 pl-3">
                {formData.description || "Describe your services here to showcase on your profile page..."}
              </p>

              {/* Gallery Preview */}
              {business?.gallery && business.gallery.length > 0 && (
                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">Gallery Photos</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {business.gallery.slice(0, 5).map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-gray-100/50 hover:opacity-90 transition-opacity">
                        <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form (Col 7) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Basic Info */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-5 w-5 text-brand-500" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Basic Info</h3>
            </div>

            {/* Business Name */}
            <div className="w-full space-y-2">
              <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="h-12 w-full rounded-xl border border-gray-300 px-5 text-[14px] font-normal transition-all outline-none focus:border-brand-500 bg-white text-text-primary"
                placeholder="e.g. SparkleWash Auto Care"
                required
              />
            </div>

            {/* Profile Logo & Cover File Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload Box */}
              <div className="space-y-2">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Profile / Logo
                </label>
                <div 
                  onClick={handleLogoClick}
                  className="h-32 border-2 border-dashed border-gray-200 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all gap-2 p-4 text-center group"
                >
                  {uploadLogoMutation.isPending ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                      <span className="text-[12px] font-semibold text-text-secondary">Upload Logo</span>
                      <span className="text-[10px] text-text-muted">JPEG or PNG, max 10MB</span>
                    </>
                  )}
                </div>
                <input 
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>

              {/* Cover Photo Upload Box */}
              <div className="space-y-2">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Cover Photo
                </label>
                <div 
                  onClick={handleCoverClick}
                  className="h-32 border-2 border-dashed border-gray-200 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all gap-2 p-4 text-center group"
                >
                  {uploadCoverMutation.isPending ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <>
                      <PhotoIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                      <span className="text-[12px] font-semibold text-text-secondary">Upload Cover</span>
                      <span className="text-[10px] text-text-muted">High resolution, max 10MB</span>
                    </>
                  )}
                </div>
                <input 
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="w-full space-y-2">
              <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Business Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-4 text-[14px] font-normal transition-all outline-none focus:border-brand-500 bg-white text-text-primary"
                rows={4}
                placeholder="Tell customers about your workshop experience, specialization, and services..."
              />
            </div>
          </Card>

          {/* Card 2: Contact & Location */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <GlobeAltIcon className="h-5 w-5 text-brand-500" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Contact & location</h3>
            </div>

            {/* Address */}
            <div className="w-full space-y-2">
              <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Branch Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="h-12 w-full rounded-xl border border-gray-300 px-5 text-[14px] font-normal transition-all outline-none focus:border-brand-500 bg-white text-text-primary"
                placeholder="e.g. 15 Road 9, Maadi, Cairo"
                required
              />
            </div>

            {/* Grid for phone and email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Phone */}
              <div className="w-full space-y-2">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="h-12 w-full rounded-xl border border-gray-300 pl-12 pr-5 text-[14px] font-normal transition-all outline-none focus:border-brand-500 bg-white text-text-primary"
                    placeholder="+20 100 123 4567"
                  />
                </div>
              </div>

              {/* Contact Email */}
              <div className="w-full space-y-2">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="h-12 w-full rounded-xl border border-gray-300 pl-12 pr-5 text-[14px] font-normal transition-all outline-none focus:border-brand-500 bg-white text-text-primary"
                    placeholder="contact@workshop.com"
                  />
                </div>
              </div>
            </div>

            {/* Location Map Picker */}
            <div className="pt-2">
              <LocationPicker 
                value={formData.location}
                onChange={(loc) => setFormData({ ...formData, location: loc })}
              />
            </div>
          </Card>

          {/* Card 3: Photo Gallery */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Photo Gallery</h3>
                <span className="text-[11px] text-text-muted mt-0.5 block">Up to 10 photos. Reorder using arrow overlays.</span>
              </div>
              <Button 
                size="sm"
                variant="flat"
                className="rounded-xl font-bold bg-brand-500/10 text-brand-600 hover:bg-brand-500/20"
                onPress={handleGalleryClick}
                isLoading={uploadGalleryMutation.isPending}
              >
                + Add Photo
              </Button>
              <input 
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            {/* Gallery Thumbnails List */}
            {business?.gallery && business.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {business.gallery.map((url, i) => (
                  <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-gray-200">
                    <img 
                      src={url} 
                      alt={`Gallery ${i}`} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlays */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      {/* Left arrow */}
                      <button
                        type="button"
                        onClick={() => handleMoveImage(i, "left")}
                        disabled={i === 0 || reorderGalleryMutation.isPending}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteGalleryMutation.mutate(url)}
                        disabled={deleteGalleryMutation.isPending}
                        className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>

                      {/* Right arrow */}
                      <button
                        type="button"
                        onClick={() => handleMoveImage(i, "right")}
                        disabled={i === business.gallery.length - 1 || reorderGalleryMutation.isPending}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-[12px] font-medium text-text-tertiary">No gallery photos added yet</span>
                <span className="text-[10px] text-text-muted mt-0.5">Upload photos of your garage/lounge to wow customers</span>
              </div>
            )}
          </Card>

          {/* Form Submit Button */}
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              size="lg"
              className="rounded-full bg-brand-500 text-white hover:bg-brand-600 h-12 px-10 text-[14px] font-bold shadow-md cursor-pointer"
              isLoading={saveProfileMutation.isPending}
            >
              Save Profile
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
