import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BudgetOverview } from "../_components/budget-overview";
import { DashboardFrame } from "../_components/dashboard-frame";
import { formatCurrency, loadDashboardData } from "../_components/dashboard-data";
import { StatsGrid } from "../_components/stats-grid";

export const revalidate = 0;

interface OverviewPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } = await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="overview"
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
            <h2 className="text-lg font-semibold text-slate-900">Create your first wallet</h2>
            <p className="text-sm text-slate-600">
              Add a wallet to unlock transaction logging, budgets, and detailed reports.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Head to the wallets tab to add a shared wallet, choose a currency, and invite your team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">Overview</p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {activeWallet ? `${activeWallet.name} overview` : "Shared wallet overview"}
              </h2>
              <p className="text-sm text-slate-600">
                Keep a live pulse on balances, budgets, categories, and reporting in one glance.
              </p>
              <p className="text-xs text-slate-500">Data for {selectedMonthLabel}.</p>
            </div>
            <StatsGrid totals={snapshot.totals} currency={currency} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <Card className="border-slate-200">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Budget health</h3>
                <p className="text-sm text-slate-600">
                  See progress against each budgeted category at a glance.
                </p>
              </CardHeader>
              <CardContent>
                <BudgetOverview budgets={snapshot.budgetSummaries} currency={currency} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-50 to-white">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Team readiness</h3>
                <p className="text-sm text-slate-600">
                  {snapshot.team ? "Team connected to this wallet." : "Currently a solo dashboard."}
                </p>
                {snapshot.teamError ? (
                  <p className="text-xs text-rose-600">{snapshot.teamError}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    {snapshot.transactions.length} records managed across {snapshot.categories.length} categories.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Net position</span>
                  <span className={`font-semibold ${snapshot.totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(currency, snapshot.totals.net)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Categories</span>
                  <span className="font-semibold text-slate-900">{snapshot.categories.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Budgets</span>
                  <span className="font-semibold text-slate-900">{snapshot.budgetSummaries.length}</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </DashboardFrame>
  );
}
