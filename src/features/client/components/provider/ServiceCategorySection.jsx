import ServiceCard from "./ServiceCard";

export default function ServiceCategorySection({
  category,
  sectionId,
  onBookService,
  selectedServices,
  onToggleService,
}) {
  if (!category?.services?.length) return null;

  const count = category.serviceCount ?? category.services.length;
  const countLabel = String(count).padStart(2, "0");
  const eyebrowLabel = (category.label || category.title || "SERVICES").toUpperCase();

  return (
    <section id={sectionId} className="mb-12 scroll-mt-28 last:mb-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        {eyebrowLabel} · {countLabel} SERVICES
      </p>
      <h2 className="mt-1.5 text-[22px] font-bold leading-tight text-text-primary sm:text-2xl">
        {category.title}{" "}
        <span className="font-bold text-brand-500">services</span>
      </h2>

      <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-5 sm:px-6">
          {category.services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              total={category.services.length}
              onBook={onBookService}
              selectedServices={selectedServices}
              onToggle={onToggleService}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
