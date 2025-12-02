import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetOverview } from "../_components/budget-overview";
import { DashboardFrame } from "../_components/dashboard-frame";
import { loadDashboardData } from "../_components/dashboard-data";
import { CreateBudgetForm } from "../_components/create-budget-form";

export const revalidate = 0;

interface BudgetManagerPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function BudgetManagerPage({ searchParams }: BudgetManagerPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } = await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="budget-manager"
      snapshot={snapshot}
      activeWallet={activeWallet}
      currency={currency}
      loadError={loadError}
      selectedMonth={selectedMonth}
      selectedMonthLabel={selectedMonthLabel}
    >
      {!hasWallets ? (
        <Card className="border-dashed border-slate-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">No wallets yet</h2>
            <p className="text-sm text-slate-600">Create a wallet first to start planning budgets.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Budget Manager</p>
            <h2 className="text-2xl font-semibold text-slate-900">Plan your limits</h2>
            <p className="text-sm text-slate-600">Build budgets by wallet or category and track how the team is pacing.</p>
            <p className="text-xs text-slate-500">Spending and remaining totals shown for {selectedMonthLabel}.</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Budget builder</h3>
                <p className="text-sm text-slate-600">
                  Assign limits to categories or the whole wallet to keep spending honest.
                </p>
              </CardHeader>
              <CardContent>
                <CreateBudgetForm walletId={snapshot.activeWalletId!} categories={snapshot.categories} currency={currency} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-50 to-white">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Budget health</h3>
                <p className="text-sm text-slate-600">See progress against each budgeted category at a glance.</p>
              </CardHeader>
              <CardContent>
                <BudgetOverview budgets={snapshot.budgetSummaries} currency={currency} />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </DashboardFrame>
  );
}
