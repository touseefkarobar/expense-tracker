import type { Metadata } from "next";

import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/server/finance-service";
import { getCurrentAccount } from "@/lib/server/session";
import { CategorySummary } from "./_components/category-summary";
import { CreateCategoryForm } from "./_components/create-category-form";
import { CreateTransactionForm } from "./_components/create-transaction-form";
import { CreateBudgetForm } from "./_components/create-budget-form";
import { BudgetOverview } from "./_components/budget-overview";
import { StatsGrid } from "./_components/stats-grid";
import { TransactionsTable } from "./_components/transactions-table";
import { WalletSelector } from "./_components/wallet-selector";
import { getCategoryIcon } from "./_components/category-metadata";

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
  let currentUser: { id: string | null; displayName: string | null } = { id: null, displayName: null };

  try {
    const [account, snapshotResult] = await Promise.all([
      getCurrentAccount(),
      getDashboardSnapshot(searchParams.wallet)
    ]);
    snapshot = snapshotResult;
    const derivedName = account?.name?.trim() || null;
    currentUser = {
      id: account?.$id ?? null,
      displayName: derivedName && derivedName.length > 0 ? derivedName : account?.email ?? null
    };
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
      categorySummaries: [],
      budgets: [],
      budgetSummaries: [],
      team: null,
      teamError: null
    };
  }

  const activeWallet =
    snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";
  const currentUserName = currentUser.displayName ?? null;

  return (
    <Shell className="space-y-10 py-12">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Shared wallet dashboard</h1>
          <p className="text-sm text-slate-600">
            Monitor balances, budgets, and activity for <strong>{activeWallet?.name ?? "your wallet"}</strong>.
          </p>
        </div>
        {snapshot.wallets.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Switch wallet</span>
            <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} />
          </div>
        ) : null}
      </section>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{loadError}</div>
      ) : null}

      {snapshot.wallets.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Create your first wallet</h2>
            <p className="text-sm text-slate-600">
              Head to the wallets tab to add a shared wallet, choose a currency, and invite your team.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Once a wallet exists, this dashboard will unlock transaction logging, budgets, and reports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsGrid totals={snapshot.totals} currency={currency} />

          <section className="grid gap-6 ">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Record a transaction</h2>
                <p className="text-sm text-slate-600">Log income or expenses and keep the wallet in sync for everyone.</p>
              </CardHeader>
              <CardContent>
                <CreateTransactionForm
                  walletId={snapshot.activeWalletId!}
                  categories={snapshot.categories}
                  currency={currency}
                  defaultMerchant={currentUserName ?? undefined}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
                <p className="text-sm text-slate-600">Organise spending buckets shared across the team.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <CreateCategoryForm walletId={snapshot.activeWalletId!} />
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Existing categories</h3>
                  {snapshot.categories.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                      No categories yet. Create one to get started.
                    </p>
                  ) : (
                    <ul className="grid gap-2 text-sm sm:grid-cols-2">
                      {snapshot.categories.map(category => {
                        const Icon = getCategoryIcon(category.icon);
                        return (
                          <li
                            key={category.$id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60"
                                style={{ backgroundColor: category.color ?? "rgba(148, 163, 184, 0.15)" }}
                              >
                                <Icon className="h-4 w-4 text-slate-700" aria-hidden="true" />
                              </span>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-700">{category.name}</span>
                                <span className="text-xs uppercase tracking-wide text-slate-400">{category.type}</span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 ">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Budget builder</h2>
                <p className="text-sm text-slate-600">Assign limits to categories or the whole wallet to keep spending honest.</p>
              </CardHeader>
              <CardContent>
                <CreateBudgetForm walletId={snapshot.activeWalletId!} categories={snapshot.categories} currency={currency} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Budget health</h2>
                <p className="text-sm text-slate-600">See progress against each budgeted category at a glance.</p>
              </CardHeader>
              <CardContent>
                <BudgetOverview budgets={snapshot.budgetSummaries} currency={currency} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 ">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
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
