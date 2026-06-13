import { Card } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { PhotoIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

export default function ReviewStep({ providerName, services, dateLabel, timeLabel }) {
  const { watch } = useFormContext();
  const notes = watch("notes") || "";
  const photos = watch("photos") || [];

  return (
    <div className="space-y-6">
      <p className="text-[15px] font-semibold text-text-primary">
        Review your booking
      </p>

      {/* Booking summary */}
      <Card className="overflow-hidden border-none shadow-none ring-1 ring-black/[0.06] rounded-2xl">
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Provider
            </span>
            <span className="text-[14px] font-semibold text-text-primary">{providerName}</span>
          </div>
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Service
              </span>
              <span className="text-[14px] font-semibold text-text-primary">{s.name}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Date & Time
            </span>
            <span className="text-[14px] font-semibold text-text-primary">
              {dateLabel} · {timeLabel}
            </span>
          </div>
        </div>
      </Card>

      {/* Notes preview (read-only) */}
      {notes && (
        <div className="rounded-2xl border border-border-default bg-surface-hover px-5 py-4 flex gap-3">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-text-muted flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Note</p>
            <p className="text-[13px] text-text-primary whitespace-pre-wrap">{notes}</p>
          </div>
        </div>
      )}

      {/* Photos preview (read-only) */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PhotoIcon className="h-4 w-4 text-text-muted" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Photos ({photos.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div
                key={`${photo.name}-${i}`}
                className="h-20 w-20 rounded-xl overflow-hidden ring-1 ring-black/5"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
