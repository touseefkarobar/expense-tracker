import Link from "next/link";

import { Shell } from "@/components/layout/shell";
import { WalletSelector } from "./wallet-selector";
import { formatCurrency } from "./dashboard-data";
import { MonthSelector } from "./month-selector";
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet2,
  type LucideIcon
} from "lucide-react";
import type { DashboardSnapshot, WalletDocument } from "@/lib/server/finance-service";

export type DashboardSection =
  | "overview"
  | "budget-manager"
  | "transactions"
  | "category-management"
  | "incomes"
  | "expenses"
  | "wallets"
  | "reports";

const navItems: Array<{ id: DashboardSection; label: string; href: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { id: "budget-manager", label: "Budget Manager", href: "/dashboard/budget-manager", icon: PiggyBank },
  { id: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { id: "category-management", label: "Category Management", href: "/dashboard/category-management", icon: FolderTree },
  { id: "incomes", label: "Incomes", href: "/dashboard/incomes", icon: TrendingUp },
  { id: "expenses", label: "Expenses", href: "/dashboard/expenses", icon: TrendingDown },
  { id: "wallets", label: "Wallets", href: "/dashboard/wallets", icon: Wallet2 },
  { id: "reports", label: "Reports", href: "/dashboard/reports", icon: BarChart3 }
];

interface DashboardFrameProps {
  children: React.ReactNode;
  searchParams: { wallet?: string; month?: string };
  section: DashboardSection;
  snapshot: DashboardSnapshot;
  activeWallet: WalletDocument | null;
  currency: string;
  loadError: string | null;
  selectedMonth: string;
  selectedMonthLabel: string;
}

export function DashboardFrame({
  children,
  searchParams,
  section,
  snapshot,
  activeWallet,
  currency,
  loadError,
  selectedMonth,
  selectedMonthLabel
}: DashboardFrameProps) {
  const incomeCount = snapshot.transactions.filter(transaction => transaction.type === "income").length;
  const expenseCount = snapshot.transactions.filter(transaction => transaction.type === "expense").length;
  const basePath = section === "overview" ? "/dashboard/overview" : `/dashboard/${section}`;

  const withQueries = (href: string) => {
    const params = new URLSearchParams();
    if (searchParams.wallet) params.set("wallet", searchParams.wallet);
    if (searchParams.month) params.set("month", searchParams.month);
    const query = params.toString();
    return query ? `${href}?${query}` : href;
  };

  return (
    <Shell className="py-10">
      <div className="grid gap-8 lg:grid-cols-[280px,1fr] xl:grid-cols-[300px,1fr]">
        <aside className="sticky top-6 h-fit space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Control center</p>
            <h1 className="text-2xl font-semibold text-slate-900">Shared wallet dashboard</h1>
            <p className="text-sm text-slate-600">Navigate across budgets, categories, transactions, and reports.</p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Active wallet</p>
                <p className="text-sm font-semibold text-slate-900">{activeWallet?.name ?? "No wallet yet"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{currency}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Net position</p>
              <p className={`text-xl font-semibold ${snapshot.totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(currency, snapshot.totals.net)}
              </p>
              <p className="text-xs text-slate-500">
                {incomeCount} incomes • {expenseCount} expenses logged
              </p>
            </div>
          </div>

          {snapshot.wallets.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Switch wallet</p>
              <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} basePath={basePath} />
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Navigation</p>
            <div className="grid gap-1">
              {navItems.map(item => {
                const active = item.id === section;
                return (
                  <Link
                    key={item.id}
                    href={withQueries(item.href)}
                    className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon
                        className={`h-4 w-4 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </span>
                    <span className={active ? "text-white" : "text-slate-300 group-hover:text-slate-500"}>→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">Viewing month</p>
              <p className="text-sm font-semibold text-slate-800">{selectedMonthLabel}</p>
            </div>
            <MonthSelector selectedMonth={selectedMonth} basePath={basePath} searchParams={searchParams} />
          </div>
          {loadError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{loadError}</div>
          ) : null}
          {children}
        </main>
      </div>
    </Shell>
  );
}
