import type { Metadata } from "next";

import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/server/finance-service";
import { CategorySummary } from "./_components/category-summary";
import { CreateCategoryForm } from "./_components/create-category-form";
import { CreateTransactionForm } from "./_components/create-transaction-form";
import { CreateWalletForm } from "./_components/create-wallet-form";
import { StatsGrid } from "./_components/stats-grid";
import { TransactionsTable } from "./_components/transactions-table";
import { WalletSelector } from "./_components/wallet-selector";

export const metadata: Metadata = {
  title: "Dashboard | Shared Wallet Expense Tracker"
};

export const revalidate = 0;

interface DashboardPageProps {
  searchParams: {
    wallet?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  let snapshot: DashboardSnapshot;
  let loadError: string | null = null;

  try {
    snapshot = await getDashboardSnapshot(searchParams.wallet);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load data from Appwrite. Check your environment variables and API key permissions.";
    snapshot = {
      wallets: [],
      activeWalletId: null,
      categories: [],
      transactions: [],
      totals: { income: 0, expenses: 0, net: 0 },
      categorySummaries: []
    };
  }

  const activeWallet =
    snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";

  return (
    <Shell className="space-y-10 py-12">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Shared wallet control centre</h1>
            <p className="mt-2 text-sm text-slate-600">
              Track income, expenses, and categories backed by Appwrite documents. Switch between wallets your team
              owns, or create a new one below.
            </p>
          </div>
          <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} />
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Workspace quickstart</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Create a wallet for your group (or switch to an existing one).</li>
            <li>Add income and expense categories.</li>
            <li>Record transactions to populate the analytics on this page.</li>
          </ol>
        </div>
      </section>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      {snapshot.wallets.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Create your first wallet</h2>
            <p className="text-sm text-slate-600">
              Wallets group transactions, categories, and team permissions. You can connect them to Appwrite Teams later.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <CreateWalletForm />
            <p className="text-xs text-slate-500">
              Tip: Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">npm run setup:appwrite</code>{" "}
              once to ensure the database schema exists before creating wallets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsGrid totals={snapshot.totals} currency={currency} />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Record a transaction</h2>
                <p className="text-sm text-slate-600">
                  Transactions update the totals instantly and are scoped to the selected wallet.
                </p>
              </CardHeader>
              <CardContent>
                <CreateTransactionForm
                  walletId={snapshot.activeWalletId!}
                  categories={snapshot.categories}
                  currency={currency}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
                <p className="text-sm text-slate-600">
                  Categories help classify both income and expenses. They feed the summary and charting widgets.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <CreateCategoryForm walletId={snapshot.activeWalletId!} />
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Existing categories
                  </h3>
                  {snapshot.categories.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                      No categories yet. Create one to get started.
                    </p>
                  ) : (
                    <ul className="grid gap-2 text-sm sm:grid-cols-2">
                      {snapshot.categories.map(category => (
                        <li
                          key={category.$id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                        >
                          <span className="text-slate-700">{category.name}</span>
                          <span
                            className={`text-xs font-semibold uppercase ${
                              category.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {category.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
                <p className="text-sm text-slate-600">
                  Delete accidental entries or capture memos to keep your audit trail tidy.
                </p>
              </CardHeader>
              <CardContent>
                <TransactionsTable
                  walletId={snapshot.activeWalletId!}
                  currency={currency}
                  transactions={snapshot.transactions}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Category summary</h2>
                <p className="text-sm text-slate-600">
                  Totals roll up by category so you can spot the highest spend or income streams.
                </p>
              </CardHeader>
              <CardContent>
                <CategorySummary summaries={snapshot.categorySummaries} currency={currency} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </Shell>
  );
}
