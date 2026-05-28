import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import CheckoutShell from "@/features/client/components/checkout/CheckoutShell";
import BookingSuccess from "@/features/client/components/checkout/BookingSuccess";
import {
  clearCheckoutConfirmedSnapshot,
  readCheckoutConfirmedSnapshot,
  resetCheckout,
} from "@/store/slices/checkoutSlice";
import { queryKeys } from "@/services/queryClient";
import { ROUTE_PATHS } from "@/routes/paths";

export default function BookingCheckoutConfirmedPage() {
  const { providerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const bookingFromStore = useSelector((s) => s.checkout.successBooking);
  const bookingFromNav = location.state?.booking ?? null;
  const bookingSnapshot = readCheckoutConfirmedSnapshot(providerId);
  const booking = bookingFromStore ?? bookingFromNav ?? bookingSnapshot;

  if (!booking) {
    return (
      <Navigate
        to={providerId ? ROUTE_PATHS.PROVIDER_DETAIL(providerId) : ROUTE_PATHS.SERVICES}
        replace
      />
    );
  }

  const goToBookings = () => {
    clearCheckoutConfirmedSnapshot(providerId);
    dispatch(resetCheckout());
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    navigate(ROUTE_PATHS.BOOKINGS, { replace: true });
  };

  return (
    <CheckoutShell backLabel="Done" onBack={goToBookings} category={null} title="Booking confirmed">
      <BookingSuccess booking={booking} onGoToBookings={goToBookings} />
    </CheckoutShell>
  );
}
