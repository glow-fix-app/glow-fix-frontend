import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button } from "@heroui/react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import LocationPicker from "@/components/ui/LocationPicker";
import { clientApi } from "@/features/client/services/clientApi";
import { setCurrentUser } from "@/store/slices/authSlice";

export default function ForceLocationModal() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // profileHydrated = true once the backend response has arrived
  // (clientLocation will be null or an object, never undefined after hydration)
  const profileHydrated = user?.role === "client" && user?.clientLocation !== undefined;

  useEffect(() => {
    if (isAuthenticated && user?.role === "client" && profileHydrated && user?.clientLocation === null) {
      setIsOpen(true);
    } else if (!isAuthenticated || (profileHydrated && user?.clientLocation !== null)) {
      setIsOpen(false);
    }
  }, [isAuthenticated, user, profileHydrated]);

  const handleSave = async () => {
    if (!location) {
      setError("Please pick a location on the map.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await clientApi.updateLocation({
        latitude: location.lat,
        longitude: location.lng,
      });

      dispatch(setCurrentUser({
        ...user,
        clientLocation: {
          latitude: location.lat,
          longitude: location.lng,
        },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save location. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <Modal.Backdrop className="bg-black/50 backdrop-blur-sm z-[100]">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog className="w-full max-w-md rounded-[28px] bg-white p-0 shadow-2xl ring-1 ring-black/5">
            <Modal.Header className="flex flex-row items-center gap-3 border-b border-gray-100 px-8 py-6 bg-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <MapPinIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Modal.Heading className="text-[18px] text-text-primary leading-tight font-bold">
                  Welcome to GlowFix!
                </Modal.Heading>
                <p className="text-[13px] text-text-tertiary mt-0.5 font-normal">
                  Please set your default location to see nearby services.
                </p>
              </div>
            </Modal.Header>
            <Modal.Body className="p-8">
              <div className="mt-2">
                <LocationPicker 
                  value={location} 
                  onChange={setLocation} 
                  error={error} 
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5 rounded-b-[28px]">
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!location}
                onPress={handleSave}
                className="rounded-full bg-brand-500 text-white h-11 px-8 text-[15px] shadow-md shadow-blue-500/20 hover:bg-brand-600 w-full sm:w-auto"
              >
                Save Location
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
