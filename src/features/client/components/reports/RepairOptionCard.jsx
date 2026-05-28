import { formatEgp } from "@/features/client/utils/formatters";

function formatDuration(minutes) {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function RepairOptionCard({ repair, selected, onToggle }) {
  return (
    <div
      className="rounded-[20px] border border-gray-200 bg-white px-5 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-50"
      onClick={() => onToggle?.(repair.id)}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox (Square with rounded corners) */}
        <div
          className={`h-[18px] w-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
            selected
              ? "bg-neutral-900 border-black"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <svg
              className="w-2.5 h-2.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div>
          <h4 className="text-[14px] text-text-primary leading-tight">
            {repair.title}
          </h4>
          {repair.duration_minutes > 0 && (
            <p className="text-[11px] text-text-muted uppercase tracking-[0.05em] mt-1">
              {formatDuration(repair.duration_minutes)}
            </p>
          )}
        </div>
      </div>

      <div className="text-[15px] text-text-primary shrink-0 ml-4">
        {formatEgp(repair.price)}
      </div>
    </div>
  );
}
