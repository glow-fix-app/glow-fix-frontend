import { Card, Button, Spinner } from "@heroui/react";
import { toast } from "@heroui/react";
import { useLoyalty } from "@/features/client/hooks/useLoyalty";
import EmptyState from "@/components/feedback/EmptyState";

export default function ClientLoyaltyPage() {
  const {
    summary,
    transactions,
    quickRedeemOptions,
    isLoading,
    error,
    redeem,
    isRedeeming,
  } = useLoyalty();

  const pointsBalance = summary?.points_balance ?? 0;
  const pointsValueEgp = summary?.points_value_egp ?? 0;
  const tierName = summary?.tier_name ?? null;
  const pointsToNextTier = summary?.points_to_next_tier ?? null;
  const nextTier = summary?.next_tier ?? null;
  const tierMax = pointsToNextTier != null ? pointsBalance + pointsToNextTier : 5000;

  // Default quick-redeem option (first option from backend or fallback 100 pts)
  const primaryOption = quickRedeemOptions[0] ?? { points: 100, value_egp: 10 };

  function handleRedeem() {
    redeem(primaryOption.points, {
      onSuccess: () =>
        toast.success(
          `${primaryOption.points} pts redeemed for EGP ${primaryOption.value_egp}!`
        ),
      onError: (err) =>
        toast.danger(err?.response?.data?.message ?? "Redemption failed. Please try again."),
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Rewards</p>
        <h1 className="text-xl font-semibold text-text-primary">Loyalty &amp; rewards</h1>
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
          {/* Points Balance Card */}
          <Card className="border border-black/[0.04] bg-gradient-to-br from-brand-500/10 to-white p-8 shadow-sm rounded-2xl">
            <div className="space-y-6">
              <div>
                {tierName && (
                  <span className="mb-2 inline-block rounded-full bg-brand-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-600">
                    {tierName}
                  </span>
                )}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Points Balance
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-semibold text-text-primary">
                    {pointsBalance.toLocaleString()}
                  </span>
                  <span className="text-[13px] font-semibold text-text-tertiary">
                    ≈ EGP {pointsValueEgp.toFixed(2)} credit
                  </span>
                </div>
              </div>

              {/* Progress to next tier */}
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${Math.min((pointsBalance / tierMax) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] font-semibold text-text-tertiary text-right">
                  {pointsToNextTier != null
                    ? `${pointsToNextTier.toLocaleString()} pts to ${nextTier ?? "next tier"}`
                    : `${pointsBalance.toLocaleString()} pts`}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Redeem */}
          <Card className="border-none bg-white p-5 shadow-sm ring-1 ring-black/5 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Quick Redeem
              </p>
              <Button
                className="h-9 rounded-xl border border-border-form bg-white px-5 text-[12px] font-semibold text-text-primary hover:bg-surface-hover"
                variant="bordered"
                isDisabled={pointsBalance < primaryOption.points || isRedeeming}
                isLoading={isRedeeming}
                onPress={handleRedeem}
              >
                Redeem {primaryOption.points} pts → EGP {primaryOption.value_egp}
              </Button>
            </div>
            {quickRedeemOptions.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {quickRedeemOptions.slice(1).map((opt) => (
                  <button
                    key={opt.points}
                    disabled={pointsBalance < opt.points || isRedeeming}
                    onClick={() =>
                      redeem(opt.points, {
                        onSuccess: () =>
                          toast.success(`${opt.points} pts redeemed for EGP ${opt.value_egp}!`),
                        onError: (err) =>
                          toast.danger(
                            err?.response?.data?.message ?? "Redemption failed."
                          ),
                      })
                    }
                    className="rounded-lg border border-border-form px-3 py-1.5 text-[11px] font-semibold text-text-secondary disabled:opacity-40 hover:bg-surface-hover transition-colors"
                  >
                    {opt.points} pts → EGP {opt.value_egp}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
            <header className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Recent Activity
              </p>
            </header>
            <div className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <p className="py-4 text-[13px] text-text-muted text-center">No recent activity.</p>
              ) : (
                transactions.map((item) => {
                  const isEarned = item.type === "EARNED";
                  const label = item.reason || (isEarned ? "Points earned" : "Points redeemed");
                  const subLabel = item.business_name
                    ? `${item.business_name}${item.booking_code ? ` · #${item.booking_code}` : ""}`
                    : item.booking_code
                    ? `#${item.booking_code}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <h4 className="truncate text-[14px] font-semibold text-text-primary">
                          {label}
                        </h4>
                        {subLabel && (
                          <p className="truncate text-[10px] font-semibold text-text-muted">
                            {subLabel}
                          </p>
                        )}
                        <p className="text-[10px] font-semibold text-text-muted">
                          {new Date(item.created_at)
                            .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                            .toUpperCase()}
                        </p>
                      </div>
                      <span
                        className={`ml-4 shrink-0 text-[15px] font-semibold ${
                          isEarned ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {isEarned ? "+" : "-"}
                        {Math.abs(item.points)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
