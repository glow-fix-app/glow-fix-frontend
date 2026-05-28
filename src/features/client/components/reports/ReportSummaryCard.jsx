// ─── Reusable: Report Summary Card ──────────────────────────────────────────────
// Shows the report summary text

export default function ReportSummaryCard({ report }) {
  if (!report?.summary) return null;

  return (
    <div>
      <h2 className="text-[20px] text-text-primary mb-4">
        Inspection summary
      </h2>
      <div className="rounded-[20px] border border-gray-200 bg-white p-6">
        <p className="text-[15px] text-text-tertiary leading-relaxed">
          {report.summary}
        </p>
      </div>
    </div>
  );
}
