import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

export function FileUploadField({ error, id, label, register: registerField, fileName }) {
  const { ref, onChange, onBlur, name } = registerField(id);

  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold text-text-secondary px-0.5" htmlFor={id}>
        {label}
      </label>
      <div
        className={`group relative flex items-center justify-between gap-4 rounded-xl border border-border-form bg-gray-50/30 p-3 transition-all hover:border-text-primary hover:bg-white ${error ? "border-red-200 bg-red-50/20" : ""
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${fileName ? "bg-neutral-600 text-white shadow-sm" : "bg-border-form text-text-muted"
              }`}
          >
            {fileName ? <DocumentIcon className="h-5 w-5" /> : <CloudArrowUpIcon className="h-5 w-5" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-semibold tracking-tight text-text-primary">{label}</p>
            {fileName ? (
              <p className="truncate text-[11px] font-medium text-text-tertiary">{fileName}</p>
            ) : (
              <p className="text-[11px] font-medium text-text-muted">No file selected</p>
            )}
          </div>
        </div>
        <label htmlFor={id} className="cursor-pointer shrink-0">
          <div className="rounded-full border border-border-form bg-white px-4 py-1.5 text-[11px] font-semibold text-text-primary transition-all hover:border-text-primary hover:bg-surface-hover hover:shadow-sm">
            {fileName ? "Change" : "Upload"}
          </div>
          <input
            id={id}
            name={name}
            ref={ref}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onBlur={onBlur}
            onChange={onChange}
          />
        </label>
      </div>
      {error ? <p className="px-1 text-[11px] font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}
