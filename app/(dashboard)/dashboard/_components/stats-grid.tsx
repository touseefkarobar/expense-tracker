import type { DashboardTotals } from "@/lib/server/finance-service";

interface StatsGridProps {
  totals: DashboardTotals;
  currency: string;
}

const formatter = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export function StatsGrid({ totals, currency }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-600">Income</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600">{formatter(currency, totals.income)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-600">Expenses</p>
        <p className="mt-2 text-2xl font-semibold text-rose-600">{formatter(currency, totals.expenses)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-600">Net position</p>
        <p
          className={`mt-2 text-2xl font-semibold ${
            totals.net >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {formatter(currency, totals.net)}
        </p>
      </div>
    </div>
  );
}
