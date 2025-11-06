import type { CategorySummary as CategorySummaryType } from "@/lib/server/finance-service";

interface CategorySummaryProps {
  summaries: CategorySummaryType[];
  currency: string;
}

const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export function CategorySummary({ summaries, currency }: CategorySummaryProps) {
  if (summaries.length === 0) {
    return <p className="text-sm text-slate-600">Record a transaction to see category totals.</p>;
  }

  const expenses = summaries.filter(summary => summary.type === "expense");
  const income = summaries.filter(summary => summary.type === "income");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Top expenses</h3>
        <ul className="mt-3 space-y-2">
          {expenses.slice(0, 5).map(summary => (
            <li
              key={summary.id}
              className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/60 px-4 py-3 text-sm text-rose-700"
            >
              <span>{summary.name}</span>
              <span>-{formatCurrency(currency, summary.total)}</span>
            </li>
          ))}
          {expenses.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              No expense categories yet.
            </li>
          ) : null}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Top income</h3>
        <ul className="mt-3 space-y-2">
          {income.slice(0, 5).map(summary => (
            <li
              key={summary.id}
              className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700"
            >
              <span>{summary.name}</span>
              <span>{formatCurrency(currency, summary.total)}</span>
            </li>
          ))}
          {income.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              No income categories yet.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
