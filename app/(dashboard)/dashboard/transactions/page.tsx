import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { loadDashboardData } from "../_components/dashboard-data";
import { CreateTransactionForm } from "../_components/create-transaction-form";
import { TransactionsTable } from "../_components/transactions-table";

export const revalidate = 0;

interface TransactionsPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const { snapshot, loadError, activeWallet, currency, currentUser, selectedMonth, selectedMonthLabel } =
    await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;
  const incomeTransactions = snapshot.transactions.filter(transaction => transaction.type === "income");
  const expenseTransactions = snapshot.transactions.filter(transaction => transaction.type === "expense");

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="transactions"
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
            <p className="text-sm text-slate-600">Create a wallet first to start logging transactions.</p>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Transactions</p>
            <h2 className="text-2xl font-semibold text-slate-900">Log activity and review history</h2>
            <p className="text-sm text-slate-600">
              Capture every income or expense, then filter and edit inline without leaving the page.
            </p>
            <p className="text-xs text-slate-500">Showing entries for {selectedMonthLabel}.</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Record a transaction</h3>
                <p className="text-sm text-slate-600">
                  Log income or expenses and keep the wallet in sync for everyone.
                </p>
              </CardHeader>
              <CardContent>
                <CreateTransactionForm
                  walletId={snapshot.activeWalletId!}
                  categories={snapshot.categories}
                  currency={currency}
                  defaultMerchant={currentUser.displayName ?? undefined}
                />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-50 to-white">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Activity pulse</h3>
                <p className="text-sm text-slate-600">
                  Quick counts and pacing to prioritise where to dive deeper.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Income entries</span>
                  <span className="font-semibold text-emerald-600">{incomeTransactions.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Expense entries</span>
                  <span className="font-semibold text-rose-600">{expenseTransactions.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="text-slate-600">Total records</span>
                  <span className="font-semibold text-slate-900">{snapshot.transactions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Recent transactions</h3>
              <p className="text-sm text-slate-600">Filter by income or expenses and correct mistakes inline.</p>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                walletId={snapshot.activeWalletId!}
                currency={currency}
                transactions={snapshot.transactions}
                categories={snapshot.categories}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardFrame>
  );
}
