import { useBillingSummary } from "@/features/client/hooks/useBillingSummary";
import SummaryCard from "@/components/ui/SummaryCard";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/features/client/utils/formatters";

export default function BillingSummaryCards() {
  const { data: summary, isLoading } = useBillingSummary();

  const cards = [
    {
      label: "Spent this month",
      value: isLoading ? "…" : formatCurrency(summary?.spentThisMonth, summary?.currency),
      icon: BanknotesIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-brand-500",
    },
    {
      label: "Bookings",
      value: isLoading ? "…" : String(summary?.bookings ?? 0),
      icon: CalendarDaysIcon,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "Loyalty points earned",
      value: isLoading ? "…" : `+${summary?.loyaltyPointsEarned ?? 0}`,
      icon: SparklesIcon,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <SummaryCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}
