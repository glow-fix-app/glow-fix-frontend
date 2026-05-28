import { Card } from "@heroui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function ReviewStep({ providerName, services, dateLabel, timeLabel }) {
  const { register, watch, setValue } = useFormContext();
  const photos = watch("photos") || [];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) return;
    setValue("photos", [...photos, ...files.slice(0, 5 - photos.length)], { shouldValidate: true });
  };

  const removePhoto = (index) => {
    setValue(
      "photos",
      photos.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-8">
      <p className="text-[15px] font-semibold text-text-primary">Review your booking</p>

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

      <div>
        <p className="text-[15px] font-semibold text-text-primary">Notes (optional)</p>
        <textarea
          rows={4}
          {...register("notes")}
          placeholder="Describe what you need..."
          className="mt-3 w-full resize-none rounded-2xl border border-border-default bg-surface-hover px-5 py-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
        />
      </div>

      <div>
        <p className="text-[15px] font-semibold text-text-primary">Photos (optional, up to 5)</p>
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div
                key={`${photo.name}-${i}`}
                className="relative group h-20 w-20 rounded-xl overflow-hidden ring-1 ring-black/5"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-surface-hover px-6 py-8 text-center transition-colors hover:border-brand-500/30 hover:bg-brand-500/[0.02]">
            <PhotoIcon className="h-6 w-6 text-text-muted" />
            <span className="text-[13px] font-medium text-text-tertiary">Add photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
