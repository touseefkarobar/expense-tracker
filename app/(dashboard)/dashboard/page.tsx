import type { Metadata } from "next";

import { MobileDashboard } from "./_components/mobile-dashboard";
import { DashboardLogoutButton } from "./_components/logout-button";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/server/finance-service";
import { getCurrentAccount } from "@/lib/server/session";

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

  const activeWallet = snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";
  const currentUserName = currentUser.displayName ?? null;

  return (
    <div className="flex flex-1">
      <MobileDashboard
        snapshot={snapshot}
        activeWallet={activeWallet}
        currency={currency}
        currentUserName={currentUserName}
        currentUserId={currentUser.id}
        loadError={loadError}
        logoutControl={<DashboardLogoutButton />}
      />
    </div>
  );
}
