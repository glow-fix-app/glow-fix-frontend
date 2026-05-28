import DashboardCard from "@/components/dashboard/DashboardCard";

export default function AdminAnalyticsPage() {
  return (
    <>
            <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Revenue">
          <p className="text-sm text-slate-600">Revenue metrics will appear here when analytics are connected.</p>
        </DashboardCard>
        <DashboardCard title="Provider utilization">
          <p className="text-sm text-slate-600">Utilization insights will appear here when analytics are connected.</p>
        </DashboardCard>
      </div>
    </>
  );
}




