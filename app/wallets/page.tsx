import type { Metadata } from "next";
import Link from "next/link";

import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/server/finance-service";
import { getCurrentAccount } from "@/lib/server/session";
import { WalletSelector } from "@/app/(dashboard)/dashboard/_components/wallet-selector";
import { CreateWalletForm } from "@/app/(dashboard)/dashboard/_components/create-wallet-form";
import { WalletTeamManager } from "@/app/(dashboard)/dashboard/_components/wallet-team-manager";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Wallets | Shared Wallet Expense Tracker"
};

const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

interface WalletsPageProps {
  searchParams: {
    wallet?: string;
  };
}

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const [account, snapshot] = await Promise.all([
    getCurrentAccount(),
    getDashboardSnapshot(searchParams.wallet)
  ]);

  const activeWallet =
    snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";
  const memberCount = snapshot.team?.memberships.length ?? 0;
  const activeMembers = snapshot.team?.memberships.filter(member => member.confirm).length ?? 0;

  return (
    <Shell className="space-y-10 py-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Wallet workspaces</h1>
          <p className="text-sm text-slate-600">
            Create focused wallets for households, trips, and business units. Link them to Appwrite Teams to control who can
            view and record transactions.
          </p>
        </div>
        {snapshot.wallets.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Active wallet</span>
            <WalletSelector
              wallets={snapshot.wallets}
              activeWalletId={snapshot.activeWalletId}
              basePath="/wallets"
            />
          </div>
        ) : null}
      </div>

      {snapshot.wallets.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Create your first wallet</h2>
            <p className="text-sm text-slate-600">
              Wallets group transactions, categories, and collaboration settings. Start by naming the wallet and choosing a
              base currency.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <CreateWalletForm />
            <p className="text-xs text-slate-500">
              Tip: run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">npm run setup:appwrite</code> once to
              provision the database collections if you have not already.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-900 py-6 text-white">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-slate-300">Overview</span>
                  <h2 className="text-2xl font-semibold">{activeWallet?.name ?? "Wallet"}</h2>
                  <p className="text-sm text-slate-200">
                    Default currency <strong>{currency}</strong>
                    {activeWallet?.monthly_budget
                      ? ` · Monthly budget ${formatCurrency(currency, activeWallet.monthly_budget)}`
                      : ""}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Net position</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatCurrency(currency, snapshot.totals.net)}
                  </p>
                  <p className="text-xs text-slate-500">Income minus expenses from recent activity.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Income recorded</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-600">
                    {formatCurrency(currency, snapshot.totals.income)}
                  </p>
                  <p className="text-xs text-slate-500">Positive cash flowing into the wallet.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Expense tracked</p>
                  <p className="mt-1 text-xl font-semibold text-rose-600">
                    {formatCurrency(currency, snapshot.totals.expenses)}
                  </p>
                  <p className="text-xs text-slate-500">Money leaving the wallet across categories.</p>
                </div>
                <div className="sm:col-span-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                      {activeMembers} active member{activeMembers === 1 ? "" : "s"}
                    </span>
                    {memberCount > activeMembers ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                        {memberCount - activeMembers} pending invite{memberCount - activeMembers === 1 ? "" : "s"}
                      </span>
                    ) : null}
                    {snapshot.team?.id ? (
                      <span className="text-xs text-slate-500">Team ID: {snapshot.team.id}</span>
                    ) : (
                      <span className="text-xs text-rose-600">
                        No Appwrite team linked yet. Create one below to enable sharing.
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed border-slate-200">
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">Spin up another wallet</h2>
                <p className="text-sm text-slate-600">
                  Segment finances by household, projects, or clients. Each wallet maintains its own categories and
                  permissions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <CreateWalletForm />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">All wallets</h2>
              <p className="text-sm text-slate-600">Switch between wallets to review spending or adjust team access.</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Wallet</th>
                      <th className="px-3 py-2">Monthly budget</th>
                      <th className="px-3 py-2">Team link</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {snapshot.wallets.map(wallet => {
                      const rowCurrency = wallet.default_currency;
                      const monthlyBudget =
                        typeof wallet.monthly_budget === "number"
                          ? formatCurrency(rowCurrency, wallet.monthly_budget)
                          : "—";
                      const isActive = wallet.$id === snapshot.activeWalletId;
                      return (
                        <tr key={wallet.$id} className={cn("bg-white", isActive ? "bg-slate-50" : undefined)}>
                          <td className="px-3 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{wallet.name}</span>
                              <span className="text-xs text-slate-500">{rowCurrency}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-600">{monthlyBudget}</td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                wallet.owner_team_id ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {wallet.owner_team_id ? "Linked" : "Not linked"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Link
                              href={`/wallets?wallet=${wallet.$id}`}
                              className="text-sm font-medium text-brand hover:underline"
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {activeWallet ? (
            <WalletTeamManager
              walletId={activeWallet.$id}
              walletName={activeWallet.name}
              team={snapshot.team}
              teamError={snapshot.teamError}
              currentUserId={account?.$id ?? null}
            />
          ) : null}
        </>
      )}
    </Shell>
  );
}
