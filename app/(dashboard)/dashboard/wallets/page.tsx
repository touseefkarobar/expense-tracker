import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardFrame } from "../_components/dashboard-frame";
import { loadDashboardData } from "../_components/dashboard-data";
import { WalletSelector } from "../_components/wallet-selector";
import { CreateWalletForm } from "../_components/create-wallet-form";
import { WalletTeamManager } from "../_components/wallet-team-manager";

export const revalidate = 0;

interface WalletsPageProps {
  searchParams: {
    wallet?: string;
    month?: string;
  };
}

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const { snapshot, loadError, activeWallet, currency, currentUser, selectedMonth, selectedMonthLabel } =
    await loadDashboardData(searchParams);
  const hasWallets = snapshot.wallets.length > 0;

  return (
    <DashboardFrame
      searchParams={searchParams}
      section="wallets"
      snapshot={snapshot}
      activeWallet={activeWallet}
      currency={currency}
      loadError={loadError}
      selectedMonth={selectedMonth}
      selectedMonthLabel={selectedMonthLabel}
    >
      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">Wallets</p>
          <h2 className="text-2xl font-semibold text-slate-900">Manage shared wallets</h2>
          <p className="text-sm text-slate-600">
            Switch between wallets or create a new one to separate teams or projects.
          </p>
        </div>

        {hasWallets ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">Active wallet</p>
                <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} basePath="/dashboard/wallets" />
                <p className="text-sm text-slate-600">
                  Each wallet keeps its own budgets, categories, and reports so collaboration stays tidy.
                </p>
              </div>
              {activeWallet ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Default currency</p>
                    <p className="font-semibold text-slate-900">{currency}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Budgets</p>
                    <p className="font-semibold text-slate-900">{snapshot.budgetSummaries.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Categories</p>
                    <p className="font-semibold text-slate-900">{snapshot.categories.length}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">{hasWallets ? "Add another wallet" : "Create your first wallet"}</h3>
            <p className="text-sm text-slate-600">
              Give it a name, set a currency, and optionally tie it to an Appwrite team.
            </p>
          </CardHeader>
          <CardContent>
            <CreateWalletForm />
          </CardContent>
        </Card>

        {activeWallet ? (
          <WalletTeamManager
            walletId={activeWallet.$id}
            walletName={activeWallet.name}
            team={snapshot.team}
            teamError={snapshot.teamError}
            currentUserId={currentUser.id}
          />
        ) : null}
      </section>
    </DashboardFrame>
  );
}
