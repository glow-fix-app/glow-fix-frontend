import { useState } from "react";
import { Button, Card, Link, Separator } from "@heroui/react";
import { formatCurrency } from "@/features/client/utils/formatters";
export default function BookingDetailsCard({ view }) {
  const [showAll, setShowAll] = useState(false);
  const lines = showAll ? view.serviceLines : view.serviceLines.slice(0, view.visibleServiceLimit);
  const hasMore = view.serviceLines.length > view.visibleServiceLimit;

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
      <Card.Header className="px-6 pt-6 pb-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted">
          Booking details
        </p>
      </Card.Header>

      <Card.Content className="px-6 pt-4 pb-0">
        <div className="space-y-2.5 mb-6">
          <div className="text-[14.5px] leading-relaxed text-text-tertiary">
            <span className="font-medium text-text-tertiary">Delivery date: </span>
            <span className="font-normal text-text-primary">{view.deliveryLabel ?? "—"}</span>
          </div>
          {view.address && (
            <div className="text-[14.5px] leading-relaxed text-text-tertiary flex flex-wrap items-center gap-x-1.5">
              <span className="font-medium text-text-tertiary">Location: </span>
              <span className="font-normal text-text-primary">{view.address}</span>
              <span className="text-text-muted">·</span>
              <Link
                href={
                  view.lat && view.lng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${view.lat},${view.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(view.address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[12px] font-bold text-brand-500 hover:underline"
              >
                View on map
              </Link>
            </div>
          )}
        </div>

        <Separator className="bg-gray-100" />

        <div className="pt-5">
          {view.serviceLines.length > 0 ? (
            <div>
              {lines.map((line, idx) => (
                <div key={line.id}>
                  {idx > 0 && <div className="border-t border-dashed border-gray-200 my-3.5" />}
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-text-tertiary font-normal">{line.title}</span>
                    <span className="text-text-primary font-semibold">{formatCurrency(line.price)}</span>
                  </div>
                </div>
              ))}
              {hasMore && (
                <Button
                  variant="light"
                  size="sm"
                  onPress={() => setShowAll((v) => !v)}
                  className="mt-3.5 h-auto min-w-0 p-0 text-[12.5px] font-bold text-brand-500 bg-transparent data-[hover=true]:bg-transparent data-[hover=true]:underline"
                >
                  {showAll ? "Show less" : `Show all ${view.serviceLines.length} services`}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-[14px] text-text-tertiary">No line items on this booking.</p>
          )}

          <Separator className="bg-gray-100 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-[14.5px] font-semibold text-text-tertiary">Total</span>
            <span className="text-[18px] font-semibold text-text-primary">
              {formatCurrency(view.totalFormatted)}
            </span>
          </div>
        </div>
      </Card.Content>

      {(view.notes || (view.problemImages && view.problemImages.length > 0)) && (
        <Card.Footer className="px-6 pb-6 pt-0">
          <div className="w-full rounded-xl bg-surface-hover px-4 py-3 border border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
              Notes & Photos from you
            </p>
            {view.notes && (
              <p className="text-[14px] text-text-tertiary leading-relaxed font-medium mb-3">{view.notes}</p>
            )}
            {view.problemImages && view.problemImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {view.problemImages.map((imgUrl, i) => (
                  <a
                    key={i}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 block"
                  >
                    <img
                      src={imgUrl}
                      alt={`Problem ${i + 1}`}
                      className="h-full w-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
}
