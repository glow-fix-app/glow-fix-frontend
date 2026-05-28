import { Link } from "react-router-dom";
import EmptyState from "@/components/feedback/EmptyState";

export default function ProviderServicesPage() {
  return (
    <>
      <div className="flex justify-end mb-6"><Link className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white" to="/provider/services/create">Create service</Link></div>
      <EmptyState title="No provider services" message="Create your first service to start accepting bookings." />
    </>
  );
}




