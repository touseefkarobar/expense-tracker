import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { loadDashboardData } from "../_components/dashboard-data";
import { CategorySummary } from "../_components/category-summary";

export const revalidate = 0;

interface ReportsPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } =
    await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="reports"
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
            <p className="text-sm text-slate-600">Create a wallet first to view reports.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Reports</p>
            <h2 className="text-2xl font-semibold text-slate-900">Category summary</h2>
            <p className="text-sm text-slate-600">
              Totals roll up by category so you can spot the highest spend or income streams.
            </p>
            <p className="text-xs text-slate-500">Report scoped to {selectedMonthLabel}.</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CategorySummary summaries={snapshot.categorySummaries} currency={currency} />
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardFrame>
  );
}
