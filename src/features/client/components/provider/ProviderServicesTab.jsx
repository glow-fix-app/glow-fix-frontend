import EmptyState from "@/components/feedback/EmptyState";
import ServiceCategorySection from "./ServiceCategorySection";

export default function ProviderServicesTab({
  categories = [],
  onBookService,
  selectedServices,
  onToggleService,
}) {
  if (!categories.length) {
    return (
      <EmptyState
        title="No services listed"
        message="This provider has not published any services yet."
      />
    );
  }

  return (
    <div>
      {categories.map((category) => (
        <ServiceCategorySection
          key={category.code}
          category={category}
          onBookService={onBookService}
          selectedServices={selectedServices}
          onToggleService={onToggleService}
        />
      ))}
    </div>
  );
}
