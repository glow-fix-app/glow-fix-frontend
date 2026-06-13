import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useProviderDetail } from "@/features/client/hooks/useProviderDetail";
import { useVehicles } from "@/features/client/hooks/useVehicles";
import { ROUTE_PATHS } from "@/routes/paths";
import { toast } from "@heroui/react";
import {
  buildScheduledAt,
  CHECKOUT_FLOW_PARAM,
  formatDateLabel,
  getNext7Days,
  parseServiceIds,
  persistCheckoutConfirmedSnapshot,
  resolveCheckoutServices,
  setCheckoutSuccessBooking,
} from "@/store/slices/checkoutSlice";

const CHECKOUT_FLOW_REVIEW = "review";
export { CHECKOUT_FLOW_REVIEW };

export function useBookingCheckout() {
  const { providerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const serviceIds = useMemo(() => parseServiceIds(searchParams), [searchParams]);
  const flowParam = searchParams.get(CHECKOUT_FLOW_PARAM);
  const initialStep = flowParam === CHECKOUT_FLOW_REVIEW ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  const providerQuery = useProviderDetail(providerId);
  const vehiclesQuery = useVehicles();
  const provider = providerQuery.provider;

  const services = useMemo(
    () => resolveCheckoutServices(provider, serviceIds),
    [provider, serviceIds]
  );

  const dates = useMemo(
    () => getNext7Days(),
    []
  );

  const form = useForm({
    defaultValues: {
      dateTimeValue: null,
      selectedDate: null,
      selectedTime: "09:00",
      selectedVehicleId: "",
      notes: "",
      photos: [],
    },
  });

  const selectedDate = form.watch("selectedDate");
  const selectedTime = form.watch("selectedTime");
  const selectedVehicleId = form.watch("selectedVehicleId");

  // No auto-date selection needed — DatePicker handles it

  const timeError = useMemo(() => {
    if (!selectedDate || !selectedTime || !provider?.operating_hours) return "";
    const dayOfWeek = selectedDate.getDay();
    const oh = provider.operating_hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!oh || (!oh.openTime && !oh.closeTime)) return "Provider is closed on this day.";
    if (oh.openTime && oh.closeTime) {
      if (selectedTime < oh.openTime || selectedTime > oh.closeTime) {
        return `Please select a time between ${oh.openTime} and ${oh.closeTime}.`;
      }
    }
    return "";
  }, [selectedDate, selectedTime, provider?.operatingHours]);

  const bookingMutation = useMutation({
    mutationFn: (payload) => clientApi.createBooking(payload),
    onSuccess: (booking) => {
      dispatch(setCheckoutSuccessBooking(booking));
      persistCheckoutConfirmedSnapshot(providerId, booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      navigate(ROUTE_PATHS.CHECKOUT_CONFIRMED(providerId), {
        replace: true,
        state: { booking },
      });
    },
    onError: (error) => {
      const respData = error?.response?.data;
      // Handle the NestJS global exception filter format: { error: { message: ... } }
      let msg = respData?.error?.message || respData?.message || "Failed to confirm booking.";
      if (Array.isArray(msg)) {
        msg = msg.join(", ");
      }
      setSubmitError(msg);
    },
  });

  const goToDateTimeStep = () => {
    setStep(1);
    const next = new URLSearchParams(searchParams);
    next.delete(CHECKOUT_FLOW_PARAM);
    setSearchParams(next, { replace: true });
  };

  const goToReviewStep = () => {
    if (timeError) {
      toast.danger(timeError);
      return;
    }
    setSubmitError("");
    setStep(2);
    const next = new URLSearchParams(searchParams);
    next.set(CHECKOUT_FLOW_PARAM, CHECKOUT_FLOW_REVIEW);
    setSearchParams(next, { replace: true });
  };

  const submitBooking = form.handleSubmit(async (values) => {
    if (!providerId || services.length === 0 || !values.selectedDate || !values.selectedTime) return;
    setSubmitError("");

    // Upload photos first (if any), then create booking with the returned CDN URLs
    let imageUrls = [];
    if (values.photos && values.photos.length > 0) {
      setIsUploading(true);
      try {
        imageUrls = await clientApi.uploadBookingImages(values.photos);
      } catch {
        setSubmitError("Failed to upload photos. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    bookingMutation.mutate({
      businessId: providerId,
      vehicleId: values.selectedVehicleId || null,
      items: services.map((service) => ({ businessServiceId: service.id })),
      scheduledAt: buildScheduledAt(values.selectedDate, values.selectedTime),
      note: values.notes || undefined,
      images: imageUrls,
    });
  });

  const dateLabel = selectedDate ? formatDateLabel(selectedDate) : "";
  const canContinue = Boolean(selectedDate && selectedTime && selectedVehicleId);
  const canSubmit = canContinue && services.length > 0 && !timeError;

  let view = "ready";
  if (providerQuery.isLoading || vehiclesQuery.isLoading) view = "loading";
  else if (!serviceIds.length) view = "empty";
  else if (providerQuery.error || services.length === 0) view = "invalid";

  return {
    view,
    step,
    form,
    shellProps: {
      category: services[0]?.category || null,
      title: provider?.businessName || "Checkout",
    },
    providerId,
    providerName: provider?.businessName || "",
    services,
    operatingHours: provider?.operatingHours || [],
    vehicles: vehiclesQuery.data ?? [],
    dateLabel,
    timeLabel: selectedTime,
    canContinue,
    canSubmit,
    showVehicleWarning: !selectedVehicleId,
    timeError,
    submitError,
    isUploading,
    isSubmitting: isUploading || bookingMutation.isPending,
    vehicleModalOpen,
    setVehicleModalOpen,
    goToDateTimeStep,
    goToReviewStep,
    submitBooking,
  };
}
