import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useProviderDetail } from "@/features/client/hooks/useProviderDetail";
import { useVehicles } from "@/features/client/hooks/useVehicles";
import { ROUTE_PATHS } from "@/routes/paths";
import {
  buildScheduledAt,
  CHECKOUT_FLOW_PARAM,
  CHECKOUT_FLOW_REVIEW,
  formatDateLabel,
  generateTimeSlots,
  getAvailableDays,
  parseServiceIds,
  persistCheckoutConfirmedSnapshot,
  resolveCheckoutServices,
  setCheckoutSuccessBooking,
} from "@/store/slices/checkoutSlice";

export function useBookingCheckout() {
  const { providerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState("");
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const serviceIds = useMemo(() => parseServiceIds(searchParams), [searchParams]);
  const initialStep = searchParams.get(CHECKOUT_FLOW_PARAM) === CHECKOUT_FLOW_REVIEW ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  const providerQuery = useProviderDetail(providerId);
  const vehiclesQuery = useVehicles();
  const provider = providerQuery.provider;

  const services = useMemo(
    () => resolveCheckoutServices(provider, serviceIds),
    [provider, serviceIds]
  );

  const dates = useMemo(
    () => getAvailableDays(provider?.operatingHours),
    [provider?.operatingHours]
  );

  const form = useForm({
    defaultValues: {
      selectedDate: null,
      selectedTime: "",
      selectedVehicleId: "",
      notes: "",
      photos: [],
    },
  });

  const selectedDate = form.watch("selectedDate");
  const selectedTime = form.watch("selectedTime");
  const selectedVehicleId = form.watch("selectedVehicleId");

  useEffect(() => {
    if (!selectedDate && dates[0]) {
      form.setValue("selectedDate", dates[0], { shouldValidate: true });
    }
  }, [dates, form, selectedDate]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayHours = provider?.operatingHours?.find(
      (entry) => entry.dayOfWeek === selectedDate.getDay()
    );
    if (dayHours?.isClosed) return [];
    return generateTimeSlots(dayHours?.openTime || "09:00", dayHours?.closeTime || "17:00");
  }, [provider?.operatingHours, selectedDate]);

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(selectedTime)) {
      form.setValue("selectedTime", timeSlots[0], { shouldValidate: true });
    }
  }, [form, selectedTime, timeSlots]);

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
      setSubmitError(error?.response?.data?.message || "Failed to confirm booking.");
    },
  });

  const goToDateTimeStep = () => {
    setStep(1);
    const next = new URLSearchParams(searchParams);
    next.delete(CHECKOUT_FLOW_PARAM);
    setSearchParams(next, { replace: true });
  };

  const goToReviewStep = () => {
    if (!selectedVehicleId) return;
    setSubmitError("");
    setStep(2);
    const next = new URLSearchParams(searchParams);
    next.set(CHECKOUT_FLOW_PARAM, CHECKOUT_FLOW_REVIEW);
    setSearchParams(next, { replace: true });
  };

  const submitBooking = form.handleSubmit((values) => {
    if (!providerId || services.length === 0 || !values.selectedDate || !values.selectedTime) return;
    setSubmitError("");
    bookingMutation.mutate({
      branchId: providerId,
      serviceIds: services.map((service) => service.id),
      scheduledAt: buildScheduledAt(values.selectedDate, values.selectedTime),
      notes: values.notes,
      vehicleId: values.selectedVehicleId || null,
    });
  });

  const dateLabel = selectedDate ? formatDateLabel(selectedDate) : "";
  const canContinue = Boolean(selectedDate && selectedTime && selectedVehicleId);
  const canSubmit = canContinue && services.length > 0;

  let view = "ready";
  if (providerQuery.isLoading || vehiclesQuery.isLoading) view = "loading";
  else if (!serviceIds.length) view = "empty";
  else if (providerQuery.error || services.length === 0) view = "invalid";

  return {
    view,
    step,
    form,
    shellProps: {
      backLabel: provider ? "Back to provider" : "Back to services",
      onBack: () =>
        navigate(providerId ? ROUTE_PATHS.PROVIDER_DETAIL(providerId) : ROUTE_PATHS.SERVICES),
      category: services[0]?.category || null,
      title: provider?.businessName || "Checkout",
    },
    providerId,
    providerName: provider?.businessName || "",
    services,
    dates,
    timeSlots,
    vehicles: vehiclesQuery.data ?? [],
    dateLabel,
    timeLabel: selectedTime,
    canContinue,
    canSubmit,
    showVehicleWarning: !selectedVehicleId,
    submitError,
    isSubmitting: bookingMutation.isPending,
    vehicleModalOpen,
    setVehicleModalOpen,
    goToReviewStep,
    goToDateTimeStep,
    submitBooking,
  };
}
