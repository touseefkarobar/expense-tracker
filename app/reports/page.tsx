import type { Metadata } from "next";
import { format, parseISO, subDays } from "date-fns";

import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/server/finance-service";
import { WalletSelector } from "@/app/(dashboard)/dashboard/_components/wallet-selector";
import { CategorySummary } from "@/app/(dashboard)/dashboard/_components/category-summary";
import { MonthlyTrendChart } from "./_components/monthly-trend-chart";

export const metadata: Metadata = {
  title: "Reports | Shared Wallet Expense Tracker"
};

const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

interface ReportsPageProps {
  searchParams: {
    wallet?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const snapshot = await getDashboardSnapshot(searchParams.wallet);

  if (snapshot.wallets.length === 0) {
    return (
      <Shell className="space-y-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Insights &amp; exports</h1>
          <p className="text-sm text-slate-600">
            Reports come to life once a wallet has transactions. Create a wallet from the dashboard to begin tracking data.
          </p>
        </div>
        <Card className="border-dashed">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">No wallets yet</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>Visit the dashboard to create a wallet, add categories, and record your first transaction.</p>
            <p>Return here once data is flowing to view monthly trends and category summaries.</p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const activeWallet =
    snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";

  const monthlyMap = new Map<
    string,
    { label: string; monthDate: Date; income: number; expenses: number; net: number }
  >();

  snapshot.transactions.forEach(transaction => {
    const occurredAt = parseISO(transaction.occurred_at);
    const monthDate = new Date(occurredAt.getFullYear(), occurredAt.getMonth(), 1);
    const key = format(monthDate, "yyyy-MM");
    const existing = monthlyMap.get(key) ?? {
      label: format(monthDate, "MMM yyyy"),
      monthDate,
      income: 0,
      expenses: 0,
      net: 0
    };

    if (transaction.type === "income") {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }
    existing.net = existing.income - existing.expenses;
    monthlyMap.set(key, existing);
  });

  const monthlyTrend = Array.from(monthlyMap.values()).sort(
    (a, b) => a.monthDate.getTime() - b.monthDate.getTime()
  );

  const thirtyDaysAgo = subDays(new Date(), 30);
  const lastThirtyDays = snapshot.transactions.filter(transaction => parseISO(transaction.occurred_at) >= thirtyDaysAgo);

  const lastThirtyTotals = lastThirtyDays.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      acc.net = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 }
  );

  const recentTransactions = snapshot.transactions.slice(0, 6);

  return (
    <Shell className="space-y-10 py-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Insights &amp; exports</h1>
          <p className="text-sm text-slate-600">
            Monitor cash flow, highlight top categories, and export the data your team needs to stay aligned.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">Wallet</span>
          <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} basePath="/reports" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Monthly trend</h2>
            <p className="text-sm text-slate-600">
              Compare income and expenses to understand how your balance evolved over time.
            </p>
          </CardHeader>
          <CardContent className="h-[360px]">
            {monthlyTrend.length > 0 ? (
              <MonthlyTrendChart
                data={monthlyTrend.map(point => ({
                  monthLabel: point.label,
                  income: point.income,
                  expenses: point.expenses,
                  net: point.net
                }))}
                currency={currency}
              />
            ) : (
              <p className="text-sm text-slate-600">
                Record transactions to visualise monthly trends across your shared wallet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Last 30 days</h2>
            <p className="text-sm text-slate-600">Snapshot of activity recorded in the past month.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Net change</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatCurrency(currency, lastThirtyTotals.net)}
              </p>
              <p className="text-xs text-slate-500">Income minus expenses captured in the last 30 days.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
                <p className="text-xs uppercase tracking-wide">Income</p>
                <p className="text-lg font-semibold">{formatCurrency(currency, lastThirtyTotals.income)}</p>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
                <p className="text-xs uppercase tracking-wide">Expenses</p>
                <p className="text-lg font-semibold">{formatCurrency(currency, lastThirtyTotals.expenses)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Need to share this data? Use Appwrite Functions to schedule CSV exports or hook into your own automation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Category breakdown</h2>
            <p className="text-sm text-slate-600">See which categories drive spending and income the most.</p>
          </CardHeader>
          <CardContent>
            <CategorySummary summaries={snapshot.categorySummaries} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Recent highlights</h2>
            <p className="text-sm text-slate-600">Most recent activity captured for this wallet.</p>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-600">No transactions yet. Record activity to build your audit trail.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentTransactions.map(transaction => {
                  const amount = formatCurrency(currency, transaction.amount);
                  const occurred = format(parseISO(transaction.occurred_at), "MMM d, yyyy");
                  const descriptor = transaction.merchant || transaction.categoryName || transaction.memo || "General";
                  const isIncome = transaction.type === "income";
                  return (
                    <li
                      key={transaction.$id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{descriptor}</span>
                        <span className="text-xs text-slate-500">{occurred}</span>
                      </div>
                      <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
                        {isIncome ? "+" : "-"}
                        {amount}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
