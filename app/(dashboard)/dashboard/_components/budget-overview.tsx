import type { BudgetSummary } from "@/lib/server/finance-service";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetProgress } from "@/components/dashboard/budget-progress";

interface BudgetOverviewProps {
  budgets: BudgetSummary[];
  currency: string;
}

export function BudgetOverview({ budgets, currency }: BudgetOverviewProps) {
  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
        No budgets yet. Create one to track spend against your plans.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {budgets.map(budget => {
        const formatter = new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: 2
        });
        const remainingIsNegative = budget.remaining < 0;
        const remainingLabel = remainingIsNegative
          ? `Over by ${formatter.format(Math.abs(budget.remaining))}`
          : formatter.format(budget.remaining);

        return (
          <Card key={budget.id} className="border border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{budget.label}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-500">
                  {budget.interval}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <BudgetProgress spent={budget.spent} limit={budget.limit} currency={currency} />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Spent</span>
                <span className="font-medium text-slate-700">{formatter.format(budget.spent)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{remainingIsNegative ? "Over budget" : "Remaining"}</span>
                <span className={cn("font-medium", remainingIsNegative ? "text-rose-600" : "text-emerald-600")}>
                  {remainingLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
