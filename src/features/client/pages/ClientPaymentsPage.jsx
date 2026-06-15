import BillingSummaryCards from "@/features/client/components/billing/BillingSummaryCards";
import BillingTransactionsTable from "@/features/client/components/billing/BillingTransactionsTable";
export default function ClientPaymentsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 pb-12">

      <BillingSummaryCards />
      <BillingTransactionsTable />
    </section>
  );
}
