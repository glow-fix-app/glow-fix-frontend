import BillingSummaryCards from "@/features/client/components/billing/BillingSummaryCards";
import BillingTransactionsTable from "@/features/client/components/billing/BillingTransactionsTable";
import PageHeader from "@/components/ui/PageHeader";

export default function ClientPaymentsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      <PageHeader
        pretitle="Payments"
        title="Billing & receipts"
        description="Track spending, download receipts, and review your booking payments in one place."
      />

      <BillingSummaryCards />
      <BillingTransactionsTable />
    </section>
  );
}
