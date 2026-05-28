import { InboxIcon } from "@heroicons/react/24/outline";

export default function EmptyState({
  title = "Nothing here yet",
  message = "New items will appear here.",
  icon: Icon = InboxIcon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg text-gray-900">{title}</h3>
      <p className="mt-1 text-base text-gray-500 max-w-xs">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}




