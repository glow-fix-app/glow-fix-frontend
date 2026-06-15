import { useBillingSummary } from "@/features/client/hooks/useBillingSummary";
import SummaryCard from "@/components/ui/SummaryCard";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/features/client/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/features/client/services/clientApi";

export default function BillingSummaryCards() {
  const { data: summary, isLoading: isSummaryLoading } = useBillingSummary();
  const { data: loyalty, isLoading: isLoyaltyLoading } = useQuery({
    queryKey: ["loyalty", "summary"],
    queryFn: clientApi.loyaltySummary,
  });

  const isLoading = isSummaryLoading || isLoyaltyLoading;

  const cards = [
    {
      label: "Spent this month",
      value: isLoading ? "…" : formatCurrency(summary?.spentThisMonth, summary?.currency),
      icon: BanknotesIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-brand-500",
    },
    {
      label: "Refunded money",
      value: isLoading ? "…" : formatCurrency(summary?.totalRefunded ?? 0, summary?.currency),
      icon: ReceiptRefundIcon,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Bookings",
      value: isLoading ? "…" : String(summary?.bookings ?? 0),
      icon: CalendarDaysIcon,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "Loyalty points available",
      value: isLoading ? "…" : String(loyalty?.total_points ?? 0),
      icon: SparklesIcon,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
