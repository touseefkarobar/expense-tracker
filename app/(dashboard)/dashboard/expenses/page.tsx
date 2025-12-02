import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { formatCurrency, loadDashboardData } from "../_components/dashboard-data";
import { TransactionsTable } from "../_components/transactions-table";

export const revalidate = 0;

interface ExpensesPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { snapshot, loadError, activeWallet, currency, selectedMonth, selectedMonthLabel } =
    await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;
  const expenseTransactions = snapshot.transactions.filter(transaction => transaction.type === "expense");

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="expenses"
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
            <p className="text-sm text-slate-600">Create a wallet first to track expenses.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Expenses</p>
            <h2 className="text-2xl font-semibold text-slate-900">Watch outflows and stay on top of spend</h2>
            <p className="text-sm text-slate-600">
              Monitor where money goes, clean up categories, and spot overspending early.
            </p>
            <p className="text-xs text-slate-500">Filtered to {selectedMonthLabel}.</p>
          </div>
          <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-white">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Expense pulse</h3>
              <p className="text-sm text-slate-700">Totals and recent outflows to help prioritise reviews.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold text-rose-700">
                -{formatCurrency(currency, snapshot.totals.expenses)}
              </p>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-rose-800">Recent expenses</p>
                {expenseTransactions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-rose-200 px-3 py-2 text-sm text-rose-800">
                    No expenses recorded yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-rose-100 text-sm">
                    {expenseTransactions.slice(0, 5).map(transaction => (
                      <li key={transaction.$id} className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-rose-800">{transaction.memo ?? "Untitled expense"}</span>
                          <span className="text-xs text-rose-700">
                            {transaction.merchant ?? "General"} • {transaction.categoryName ?? "Uncategorised"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-rose-700">
                          -{formatCurrency(currency, transaction.amount)}
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
              <h3 className="text-lg font-semibold text-slate-900">Expense transactions</h3>
              <p className="text-sm text-slate-600">Filter, edit, or delete expenses directly from the table.</p>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                walletId={snapshot.activeWalletId!}
                currency={currency}
                transactions={expenseTransactions}
                categories={snapshot.categories}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardFrame>
  );
}
