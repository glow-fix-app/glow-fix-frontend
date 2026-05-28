import { Card, Button, Spinner } from "@heroui/react";
import { useLoyalty } from "@/features/client/hooks/useLoyalty";
import EmptyState from "@/components/feedback/EmptyState";

export default function ClientLoyaltyPage() {
  const { config, transactions = [], isLoading, error } = useLoyalty();

  const totalPoints = transactions.reduce((acc, curr) => acc + curr.points, 0);
  const creditValue = totalPoints * (config?.[0]?.egp_per_point || 0.1);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Rewards</p>
        <h1 className="text-xl font-semibold text-text-primary">Loyalty & rewards</h1>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading rewards"
          message="There was an issue fetching your loyalty info. Please try again later."
        />
      ) : (
        <>
          {/* Points Card */}
          <Card className="border border-black/[0.04] bg-gradient-to-br from-brand-500/10 to-white p-8 shadow-sm rounded-2xl">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">Points Balance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-semibold text-text-primary">{totalPoints.toLocaleString()}</span>
                  <span className="text-[13px] font-semibold text-text-tertiary">≈ EGP {creditValue.toFixed(2)} credit</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${Math.min((totalPoints / 5000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] font-semibold text-text-tertiary text-right">
                  {totalPoints} / 5,000 to next tier
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Redeem */}
          <Card className="border-none bg-white p-5 shadow-sm ring-1 ring-black/5 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Quick Redeem</p>
              <Button
                className="h-9 rounded-xl border border-border-form bg-white px-5 text-[12px] font-semibold text-text-primary hover:bg-surface-hover"
                variant="bordered"
                isDisabled={totalPoints < 100}
              >
                Redeem 100 pts → EGP {(100 * (config?.[0]?.egp_per_point || 0.1)).toFixed(0)}
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
            <header className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Recent Activity</p>
            </header>
            <div className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <p className="py-4 text-[13px] text-text-muted text-center">No recent activity.</p>
              ) : (
                transactions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <h4 className="truncate text-[14px] font-semibold text-text-primary">{item.description}</h4>
                      <p className="text-[10px] font-semibold text-text-muted">
                        {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}
                      </p>
                    </div>
                    <span className={`text-[15px] font-semibold ${item.points >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {item.points >= 0 ? "+" : ""}{item.points}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
