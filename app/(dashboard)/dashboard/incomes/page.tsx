import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { formatCurrency, loadDashboardData } from "../_components/dashboard-data";
import { TransactionsTable } from "../_components/transactions-table";

export const revalidate = 0;

interface IncomesPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function IncomesPage({ searchParams }: IncomesPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } = await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;
  const incomeTransactions = snapshot.transactions.filter(transaction => transaction.type === "income");

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="incomes"
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
            <p className="text-sm text-slate-600">Create a wallet first to track incomes.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Incomes</p>
            <h2 className="text-2xl font-semibold text-slate-900">Track earnings and inflows</h2>
            <p className="text-sm text-slate-600">
              Review income streams, make edits inline, and keep the plan in balance.
            </p>
            <p className="text-xs text-slate-500">Filtered to {selectedMonthLabel}.</p>
          </div>
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Income pulse</h3>
              <p className="text-sm text-slate-700">
                Totals and quick recent entries to keep earnings in view.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold text-emerald-700">
                {formatCurrency(currency, snapshot.totals.income)}
              </p>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-emerald-800">Recent income</p>
                {incomeTransactions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                    No income recorded yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-emerald-100 text-sm">
                    {incomeTransactions.slice(0, 5).map(transaction => (
                      <li key={transaction.$id} className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-emerald-800">{transaction.memo ?? "Untitled income"}</span>
                          <span className="text-xs text-emerald-700">
                            {transaction.merchant ?? "General"} • {transaction.categoryName ?? "Uncategorised"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">
                          +{formatCurrency(currency, transaction.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Income transactions</h3>
              <p className="text-sm text-slate-600">Filter, edit, or delete incomes directly from the table.</p>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                walletId={snapshot.activeWalletId!}
                currency={currency}
                transactions={incomeTransactions}
                categories={snapshot.categories}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardFrame>
  );
}
