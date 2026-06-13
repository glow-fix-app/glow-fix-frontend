import { PhotoIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function NotesStep() {
  const { register, watch, setValue } = useFormContext();
  const photos = watch("photos") || [];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) return;
    setValue("photos", [...photos, ...files.slice(0, 5 - photos.length)], {
      shouldValidate: true,
    });
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
      <div>
        <p className="text-[15px] font-semibold text-text-primary">
          Add notes (optional)
        </p>
        <p className="text-[12px] text-text-muted mt-1">
          Tell the service provider what you need or any specific concerns.
        </p>
        <textarea
          rows={5}
          {...register("notes")}
          placeholder="Describe what you need, e.g. 'Engine makes a knocking sound when accelerating'…"
          className="mt-4 w-full resize-none rounded-2xl border border-border-default bg-surface-hover px-5 py-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
        />
      </div>

      <div>
        <p className="text-[15px] font-semibold text-text-primary">
          Problem photos (optional, up to 5)
        </p>
        <p className="text-[12px] text-text-muted mt-1">
          Add photos to help the provider understand the issue better.
        </p>

        {photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div
                key={`${photo.name}-${i}`}
                className="relative group h-24 w-24 rounded-xl overflow-hidden ring-1 ring-black/5"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 5 && (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-surface-hover px-6 py-8 text-center transition-colors hover:border-brand-500/30 hover:bg-brand-500/[0.02]">
            <PhotoIcon className="h-7 w-7 text-text-muted" />
            <span className="text-[13px] font-medium text-text-tertiary">
              Click to add photos
            </span>
            <span className="text-[11px] text-text-muted">
              {photos.length}/5 uploaded
            </span>
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
