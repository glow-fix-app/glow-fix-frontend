import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Spinner, Button } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "@/components/feedback/EmptyState";
import ProviderAboutTab from "@/features/client/components/provider/ProviderAboutTab";
import ProviderBanner from "@/features/client/components/provider/ProviderBanner";
import ProviderHeader from "@/features/client/components/provider/ProviderHeader";
import ProviderReviewsTab from "@/features/client/components/provider/ProviderReviewsTab";
import ProviderServicesTab from "@/features/client/components/provider/ProviderServicesTab";
import ProviderTabs from "@/features/client/components/provider/ProviderTabs";
import { useProviderDetail } from "@/features/client/hooks/useProviderDetail";
import { buildCheckoutPath, clearCheckoutConfirmedSnapshot, resetCheckout } from "@/store/slices/checkoutSlice";
import { formatEgp } from "@/features/client/utils/formatters";

export default function ProviderDetailPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("services");
  const [selectedServices, setSelectedServices] = useState([]);
  const { provider, isLoading, error } = useProviderDetail(providerId);

  const handleDirections = () => {
    if (provider?.lat == null || provider?.lng == null) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleToggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleBookService = (service) => {
    if (!provider?.id) return;
    dispatch(resetCheckout());
    clearCheckoutConfirmedSnapshot(provider.id);
    navigate(buildCheckoutPath(provider.id, [service.id]));
  };

  return (
    <div className="bg-white pb-16">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" color="primary" />
        </div>
      ) : error || !provider ? (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-text-tertiary hover:text-text-primary"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to discover
          </button>
          <EmptyState
            title="Provider not found"
            message="This provider may be unavailable or the link is incorrect."
            action={
              <button
                type="button"
                onClick={() => navigate("/services")}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Browse providers
              </button>
            }
          />
        </div>
      ) : (
        <>
          <ProviderBanner
            coverUrl={provider.coverUrl}
          />

          <ProviderHeader
            provider={provider}
            onDirections={handleDirections}
          />

          <div className="mt-8">
            <ProviderTabs activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-10">
              {activeTab === "services" && (
                <ProviderServicesTab
                  categories={provider.serviceCategories}
                  onBookService={handleBookService}
                  selectedServices={selectedServices}
                  onToggleService={handleToggleService}
                />
              )}
              {activeTab === "reviews" && (
                <ProviderReviewsTab 
                  reviews={provider.reviews} 
                  avgRating={provider.avgRating}
                  reviewCount={provider.reviewCount}
                  businessName={provider.businessName}
                />
              )}
              {activeTab === "about" && (
                <ProviderAboutTab
                  about={provider.about}
                  operatingHours={provider.operatingHours}
                  gallery={provider.gallery}
                />
              )}
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4 rounded-full border border-gray-200/80 bg-white/95 p-3.5 pl-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                    Selected ({selectedServices.length})
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-text-primary">
                    Total:{" "}
                    {formatEgp(
                      selectedServices.reduce(
                        (acc, s) => acc + (Number(s.price) || 0),
                        0
                      )
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-brand-500 text-white hover:bg-brand-600 h-10 px-5 text-[13px] font-semibold"
                  onPress={() => {
                    if (!provider?.id) return;
                    dispatch(resetCheckout());
                    clearCheckoutConfirmedSnapshot(provider.id);
                    navigate(buildCheckoutPath(provider.id, selectedServices.map((s) => s.id)));
                  }}
                >
                  Book selected
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
