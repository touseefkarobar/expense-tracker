interface BudgetProgressProps {
  label?: string;
  spent: number;
  limit: number;
  currency: string;
}

export function BudgetProgress({ label, spent, limit, currency }: BudgetProgressProps) {
  const ratio = limit > 0 ? spent / limit : 0;
  const rawPercentage = Math.round(ratio * 100);
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const displayPercentage = Math.max(0, rawPercentage);
  const statusColor =
    rawPercentage >= 100 ? "bg-rose-500" : rawPercentage >= 80 ? "bg-amber-500" : "bg-emerald-500";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  });

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label ?? ""}</span>
        <span>
          {formatter.format(spent)} / {formatter.format(limit)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`${statusColor} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-slate-500">{displayPercentage}% of budget used</p>
    </div>
  );
}
