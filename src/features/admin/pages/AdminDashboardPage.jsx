import DashboardCard from "@/components/dashboard/DashboardCard";


export default function AdminDashboardPage() {
  return (
    <>
      
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DashboardCard title="Booking volume">
          <p className="text-sm text-slate-600">Connect backend metrics to visualize booking volume here.</p>
        </DashboardCard>
        <DashboardCard title="Operational notes">
          <p className="text-sm text-slate-600">Connect backend metrics to replace this starter content.</p>
        </DashboardCard>
      </div>
    </>
  );
}




