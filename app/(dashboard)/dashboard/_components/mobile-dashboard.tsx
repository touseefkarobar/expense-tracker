"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CreditCard, LayoutDashboard, LineChart, PiggyBank, Tags, Wallet2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  CreditCard,
  LogOut,
  PieChart as PieChartIcon,
  Wallet2
} from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type {
  DashboardSnapshot,
  WalletDocument
} from "@/lib/server/finance-service";
import { cn } from "@/lib/utils/cn";

import { BudgetOverview } from "./budget-overview";
import { CategorySummary } from "./category-summary";
import { CreateBudgetForm } from "./create-budget-form";
import { CreateCategoryForm } from "./create-category-form";
import { CreateTransactionForm } from "./create-transaction-form";
import { CreateWalletForm } from "./create-wallet-form";
import { getCategoryIcon } from "./category-metadata";
import { TransactionsTable } from "./transactions-table";
import { WalletSelector } from "./wallet-selector";
import { WalletTeamManager } from "./wallet-team-manager";

type Screen = "overview" | "transactions" | "categories" | "budgets" | "reports" | "wallets";

const NAV_ITEMS: Array<{ id: Screen; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "budgets", label: "Budgets", icon: PiggyBank },
  { id: "reports", label: "Reports", icon: LineChart },
  { id: "wallets", label: "Wallets", icon: Wallet2 }
];
const PIE_COLORS = ["#ef4444", "#f97316", "#facc15", "#22d3ee", "#a855f7", "#34d399", "#38bdf8"];

type Screen = "home" | "accounts" | "budgets" | "transactions" | "reports";

const SCREEN_TITLE: Record<Exclude<Screen, "home">, string> = {
  accounts: "Accounts",
  budgets: "Budgets",
  transactions: "Transactions",
  reports: "Reports"
};

interface MobileDashboardProps {
  snapshot: DashboardSnapshot;
  activeWallet: WalletDocument | null;
  currency: string;
  currentUserName: string | null;
  currentUserId: string | null;
  loadError: string | null;
  logoutControl: ReactNode;
}

export function MobileDashboard({
  snapshot,
  activeWallet,
  currency,
  currentUserName,
  currentUserId,
  loadError,
  logoutControl
}: MobileDashboardProps) {
  const [screen, setScreen] = useState<Screen>("overview");
  loadError,
  logoutControl
}: MobileDashboardProps) {
  const [screen, setScreen] = useState<Screen>("home");
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }),
    [currency]
  );

  const recentTransactions = snapshot.transactions.slice(0, 5);

  return (
    <div className="relative flex min-h-[720px] flex-1 flex-col overflow-hidden rounded-[32px] bg-slate-50 shadow-2xl ring-1 ring-slate-900/10">
      <div className="pointer-events-none absolute inset-x-0 top-[-40%] h-[65%] rounded-[40%] bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(15,23,42,0.2)_55%,_transparent_80%)]" />
      <header className="relative z-10 px-6 pt-8 pb-6 text-white">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Shared wallet</span>
          <div>
            <h2 className="text-2xl font-semibold leading-tight">
              {activeWallet?.name ?? "No wallet selected"}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Net balance {" "}
              <span className="font-semibold text-white">{formatter.format(snapshot.totals.net)}</span>
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-white/10 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Currency</span>
              <span className="font-semibold text-white">{currency}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-white/70">
              <span>Income {formatter.format(snapshot.totals.income)}</span>
              <span>Expenses {formatter.format(Math.abs(snapshot.totals.expenses))}</span>
            </div>
          </div>
          {snapshot.wallets.length > 0 ? (
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-900/10">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Switch wallet</span>
                <span>{snapshot.wallets.length} available</span>
              </div>
              <div className="mt-3">
                <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/40 bg-white/10 p-4 text-sm text-white/80">
              Create your first wallet below to start tracking transactions.
            </div>
          )}
        </div>
      </header>

      {loadError ? (
        <div className="relative z-10 mx-5 mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
          {loadError}
        </div>
      ) : null}

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-28 pt-2">
        {screen === "overview" ? (
          <OverviewScreen
            formatter={formatter}
            totals={snapshot.totals}
            budgets={snapshot.budgetSummaries}
            categories={snapshot.categorySummaries}
            transactions={recentTransactions}
            onNavigate={setScreen}
            logoutControl={logoutControl}
            currency={currency}
            currentUserName={currentUserName}
          />
        ) : null}
        {screen === "transactions" ? (
          <TransactionsScreen
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            currency={currency}
            transactions={snapshot.transactions}
          />
        ) : null}
        {screen === "categories" ? (
          <CategoriesScreen walletId={snapshot.activeWalletId} categories={snapshot.categories} />
        ) : null}
        {screen === "budgets" ? (
          <BudgetsScreen
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            currency={currency}
            budgets={snapshot.budgetSummaries}
          />
        ) : null}
        {screen === "reports" ? (
          <ReportsScreen
            formatter={formatter}
            totals={snapshot.totals}
            categories={snapshot.categorySummaries}
            currency={currency}
          />
        ) : null}
        {screen === "wallets" ? (
          <WalletsScreen
            snapshot={snapshot}
            activeWallet={activeWallet}
            currency={currency}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
          />
        ) : null}
      </div>

      <nav className="relative z-20 mt-auto border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-3 gap-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
  const expenseSummaries = useMemo(
    () => snapshot.categorySummaries.filter(summary => summary.type === "expense" && summary.total > 0),
    [snapshot.categorySummaries]
  );

  const totalBudgetLimit = useMemo(
    () => snapshot.budgetSummaries.reduce((acc, budget) => acc + budget.limit, 0),
    [snapshot.budgetSummaries]
  );
  const totalBudgetRemaining = useMemo(
    () => snapshot.budgetSummaries.reduce((acc, budget) => acc + budget.remaining, 0),
    [snapshot.budgetSummaries]
  );

  const expensePieData = useMemo(() => {
    if (expenseSummaries.length === 0) {
      return [{ name: "Uncategorised", value: snapshot.totals.expenses || 0 }];
    }
    return expenseSummaries.map(summary => ({ name: summary.name, value: Math.abs(summary.total) }));
  }, [expenseSummaries, snapshot.totals.expenses]);

  const recentTransactions = snapshot.transactions.slice(0, 12);

  return (
    <div className="relative flex min-h-[640px] flex-1 flex-col overflow-hidden rounded-[32px] bg-slate-950 text-slate-100 shadow-2xl ring-1 ring-slate-900/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.1),_transparent_50%)]" />
      <header className="flex items-center gap-3 border-b border-white/5 px-7 py-6">
        {screen !== "home" ? (
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 transition hover:bg-white/10"
            aria-label="Go back to overview"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        ) : null}
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/60">
            {activeWallet?.name ?? "Shared wallet"}
          </span>
          <h2 className="text-lg font-semibold text-white">
            {screen === "home" ? "Overview" : SCREEN_TITLE[screen]}
          </h2>
        </div>
      </header>
      {loadError ? (
        <div className="mx-6 mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-100">
          {loadError}
        </div>
      ) : null}
      <div className="relative flex-1 overflow-y-auto px-6 pb-8 pt-6">
        {screen === "home" ? (
          <HomeScreen
            formatter={formatter}
            totals={{
              income: snapshot.totals.income,
              expenses: snapshot.totals.expenses,
              net: snapshot.totals.net
            }}
            budget={{
              limit: totalBudgetLimit,
              remaining: totalBudgetRemaining
            }}
            onNavigate={setScreen}
            logoutControl={logoutControl}
          />
        ) : null}
        {screen === "accounts" ? (
          <AccountsScreen
            formatter={formatter}
            currentUserName={currentUserName}
            totals={{
              income: snapshot.totals.income,
              expenses: snapshot.totals.expenses,
              net: snapshot.totals.net
            }}
          />
        ) : null}
        {screen === "budgets" ? (
          <BudgetsScreen
            formatter={formatter}
            summaries={snapshot.budgetSummaries}
            limit={totalBudgetLimit}
            remaining={totalBudgetRemaining}
          />
        ) : null}
        {screen === "transactions" ? (
          <TransactionsScreen formatter={formatter} transactions={recentTransactions} />
        ) : null}
        {screen === "reports" ? (
          <ReportsScreen formatter={formatter} pieData={expensePieData} totals={snapshot.totals} />
        ) : null}
      </div>
    </div>
  );
}

interface OverviewScreenProps {
  formatter: Intl.NumberFormat;
  totals: DashboardSnapshot["totals"];
  budgets: DashboardSnapshot["budgetSummaries"];
  categories: DashboardSnapshot["categorySummaries"];
  transactions: DashboardSnapshot["transactions"];
  onNavigate: (screen: Screen) => void;
  logoutControl: ReactNode;
  currency: string;
  currentUserName: string | null;
}

function OverviewScreen({
  formatter,
  totals,
  budgets,
  categories,
  transactions,
  onNavigate,
  logoutControl,
  currency,
  currentUserName
}: OverviewScreenProps) {
  const netIsPositive = totals.net >= 0;
  const quickActions: Array<{ label: string; icon: LucideIcon; screen: Screen; tone?: "primary" | "neutral" }> = [
    { label: "Record transaction", icon: CreditCard, screen: "transactions", tone: "primary" },
    { label: "New category", icon: Tags, screen: "categories" },
    { label: "Create budget", icon: PiggyBank, screen: "budgets" },
    { label: "Manage wallets", icon: Wallet2, screen: "wallets" }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-900/5">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-6 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Net position</p>
            <p className="mt-2 text-3xl font-semibold">{formatter.format(totals.net)}</p>
            <p className="mt-2 text-sm text-white/70">
              {netIsPositive ? "You are in the green." : "Spending outpaces income."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Income" value={formatter.format(totals.income)} tone="positive" />
            <StatPill label="Expenses" value={formatter.format(Math.abs(totals.expenses))} tone="negative" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {quickActions.map(action => {
          const Icon = action.icon;
          const isPrimary = action.tone === "primary";
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => onNavigate(action.screen)}
              className={cn(
                "flex min-h-[92px] flex-col justify-between rounded-3xl px-4 py-4 text-left shadow-lg transition",
                isPrimary
                  ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-900/10 hover:ring-slate-900/20"
              )}
            >
              <Icon className={cn("h-5 w-5", isPrimary ? "text-white" : "text-slate-500")} aria-hidden="true" />
              <span className="text-sm font-semibold leading-tight">{action.label}</span>
            </button>
          );
        })}
      </section>

      <MobileSection
        title="Budget health"
        description="Track how close you are to the limits you set for this wallet."
      >
        <BudgetOverview budgets={budgets} currency={currency} />
      </MobileSection>

      <MobileSection
        title="Category breakdown"
        description="See which categories are driving income and expenses."
      >
        <CategorySummary summaries={categories} currency={currency} />
      </MobileSection>

      <MobileSection title="Recent activity" description="Your latest transactions appear here.">
        <RecentTransactionsList formatter={formatter} transactions={transactions} />
      </MobileSection>

      <MobileSection title="Account" description="Sign out securely when you are done.">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Logged in as <span className="font-semibold text-slate-900">{currentUserName ?? "You"}</span>
          </div>
          {logoutControl}
        </div>
      </MobileSection>
interface HomeScreenProps {
  formatter: Intl.NumberFormat;
  totals: { income: number; expenses: number; net: number };
  budget: { limit: number; remaining: number };
  onNavigate: (screen: Screen) => void;
  logoutControl: ReactNode;
}

function HomeScreen({ formatter, totals, budget, onNavigate, logoutControl }: HomeScreenProps) {
  const budgetUsed = budget.limit ? Math.max(0, budget.limit - budget.remaining) : 0;
  const budgetProgress = budget.limit > 0 ? Math.min(100, Math.round((budgetUsed / budget.limit) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate("accounts")}
          className="col-span-2 flex min-h-[92px] flex-col justify-between rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4 text-left shadow-lg"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
            <span>Account balance</span>
            <Wallet2 className="h-5 w-5 text-white/80" />
          </div>
          <p className="text-3xl font-semibold text-white">{formatter.format(totals.net)}</p>
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate("accounts")}
            className="flex flex-col justify-between rounded-3xl bg-emerald-500 px-4 py-4 text-left text-white shadow-lg"
          >
            <span className="text-xs uppercase tracking-wide text-white/80">Income</span>
            <p className="text-2xl font-semibold">{formatter.format(totals.income)}</p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("accounts")}
            className="flex flex-col justify-between rounded-3xl bg-rose-500 px-4 py-4 text-left text-white shadow-lg"
          >
            <span className="text-xs uppercase tracking-wide text-white/80">Expenses</span>
            <p className="text-2xl font-semibold">{formatter.format(Math.abs(totals.expenses))}</p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("budgets")}
            className="col-span-2 flex flex-col gap-3 rounded-3xl bg-amber-400 px-4 py-4 text-left text-slate-900 shadow-lg"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-900/70">
              <span>Budget</span>
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{formatter.format(budget.remaining)} left</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-900/70">
                {budget.limit ? `${formatter.format(budget.limit)} total` : "No budgets configured"}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900/20">
              <div className="h-full rounded-full bg-slate-900/70" style={{ width: `${budgetProgress}%` }} />
            </div>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm font-semibold uppercase tracking-wide text-white/70">
        <ShortcutButton icon={<CreditCard className="h-5 w-5" />} label="Transactions" onClick={() => onNavigate("transactions")} />
        <ShortcutButton icon={<PieChartIcon className="h-5 w-5" />} label="Reports" onClick={() => onNavigate("reports")} />
        <ShortcutButton icon={<Activity className="h-5 w-5" />} label="Budgets" onClick={() => onNavigate("budgets")} />
        <ShortcutButton icon={<LogOut className="h-5 w-5" />} label="Sign out" extra={logoutControl} />
      </div>
    </div>
  );
}

interface TransactionsScreenProps {
  walletId: string | null;
  categories: DashboardSnapshot["categories"];
  currency: string;
  transactions: DashboardSnapshot["transactions"];
}

function TransactionsScreen({ walletId, categories, currency, transactions }: TransactionsScreenProps) {
  if (!walletId) {
    return <EmptyState message="Create a wallet to start recording transactions." />;
  }

  return (
    <div className="space-y-6">
      <MobileSection
        title="Record a transaction"
        description="Log income or expenses and keep the wallet in sync for everyone."
      >
        <CreateTransactionForm
          walletId={walletId}
          categories={categories}
          currency={currency}
        />
      </MobileSection>
      <MobileSection
        title="Transactions"
        description="Filter, edit, and review recent activity."
      >
        <div className="overflow-x-auto">
          <TransactionsTable
            walletId={walletId}
            currency={currency}
            transactions={transactions}
            categories={categories}
          />
        </div>
      </MobileSection>
    </div>
  );
}

interface CategoriesScreenProps {
  walletId: string | null;
  categories: DashboardSnapshot["categories"];
}

function CategoriesScreen({ walletId, categories }: CategoriesScreenProps) {
  if (!walletId) {
    return <EmptyState message="Create a wallet before managing categories." />;
  }

  return (
    <div className="space-y-6">
      <MobileSection
        title="Create category"
        description="Organise spending buckets shared across the team."
      >
        <CreateCategoryForm walletId={walletId} />
      </MobileSection>
      <MobileSection
        title="Existing categories"
        description="Tap a category to review its type and colour."
      >
        <CategoriesList categories={categories} />
      </MobileSection>
function ShortcutButton({
  icon,
  label,
  onClick,
  extra
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  extra?: ReactNode;
}) {
  if (extra) {
    return (
      <div className="col-span-2 flex flex-col gap-2 rounded-3xl bg-white/5 px-4 py-4 text-white/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">{icon}</div>
          <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
        </div>
        {extra}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-4 text-left text-white/80 transition hover:bg-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">{icon}</div>
        <span>{label}</span>
      </div>
    </button>
  );
}

interface AccountsScreenProps {
  formatter: Intl.NumberFormat;
  currentUserName: string | null;
  totals: { income: number; expenses: number; net: number };
}

function AccountsScreen({ formatter, currentUserName, totals }: AccountsScreenProps) {
  const balance = totals.net;
  const expenses = Math.abs(totals.expenses);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-wide text-white/60">Primary account holder</p>
        <p className="mt-1 text-lg font-semibold text-white">{currentUserName ?? "You"}</p>
        <p className="mt-2 text-xs text-white/60">Balances stay synced across devices and sessions.</p>
      </div>
      <div className="space-y-3">
        <AccountRow label="Current balance" amount={formatter.format(balance)} checked />
        <AccountRow label="Total income" amount={formatter.format(totals.income)} />
        <AccountRow label="Total spent" amount={formatter.format(expenses)} negative />
      </div>
    </div>
  );
}

interface BudgetsScreenProps {
  walletId: string | null;
  categories: DashboardSnapshot["categories"];
  currency: string;
  budgets: DashboardSnapshot["budgetSummaries"];
}

function BudgetsScreen({ walletId, categories, currency, budgets }: BudgetsScreenProps) {
  if (!walletId) {
    return <EmptyState message="Create a wallet to start budgeting." />;
  }

  return (
    <div className="space-y-6">
      <MobileSection
        title="Budget builder"
        description="Assign limits to categories or the whole wallet to keep spending honest."
      >
        <CreateBudgetForm walletId={walletId} categories={categories} currency={currency} />
      </MobileSection>
      <MobileSection
        title="Budget health"
        description="See progress against each budgeted category at a glance."
      >
        <BudgetOverview budgets={budgets} currency={currency} />
      </MobileSection>
function AccountRow({ label, amount, checked, negative }: { label: string; amount: string; checked?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-4 text-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/5">
          {checked ? <CheckCircle2 className="h-4 w-4 text-teal-300" /> : <Circle className="h-3 w-3 text-white/40" />}
        </span>
        <span className="text-white/80">{label}</span>
      </div>
      <span className={cn("font-semibold", negative ? "text-rose-300" : "text-white")}>{amount}</span>
    </div>
  );
}

interface ReportsScreenProps {
  formatter: Intl.NumberFormat;
  totals: DashboardSnapshot["totals"];
  categories: DashboardSnapshot["categorySummaries"];
  currency: string;
}

function ReportsScreen({ formatter, totals, categories, currency }: ReportsScreenProps) {
  return (
    <div className="space-y-6">
      <MobileSection title="Balance snapshot" description="Income, expenses, and net balance for this wallet.">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatPill label="Income" value={formatter.format(totals.income)} tone="positive" />
          <StatPill label="Expenses" value={formatter.format(Math.abs(totals.expenses))} tone="negative" />
          <StatPill label="Net" value={formatter.format(totals.net)} tone="neutral" />
        </div>
      </MobileSection>
      <MobileSection
        title="Category summary"
        description="Totals roll up by category so you can spot the highest spend or income streams."
      >
        <CategorySummary summaries={categories} currency={currency} />
      </MobileSection>
    </div>
  );
}

interface WalletsScreenProps {
  snapshot: DashboardSnapshot;
  activeWallet: WalletDocument | null;
  currency: string;
  currentUserName: string | null;
  currentUserId: string | null;
}

function WalletsScreen({ snapshot, activeWallet, currency, currentUserName, currentUserId }: WalletsScreenProps) {
  return (
    <div className="space-y-6">
      <MobileSection
        title="Wallet overview"
        description={activeWallet ? "Details for the active wallet." : "Create or switch wallets to get started."}
      >
        {activeWallet ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">{activeWallet.name}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {currency}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Logged in as</p>
              <p className="text-sm font-semibold text-slate-900">{currentUserName ?? "You"}</p>
            </div>
            {typeof activeWallet.monthly_budget === "number" ? (
              <p>
                Monthly budget: <span className="font-semibold text-slate-900">{new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0
                }).format(activeWallet.monthly_budget)}</span>
              </p>
            ) : (
              <p className="text-slate-500">No monthly budget set.</p>
            )}
          </div>
        ) : (
          <EmptyState message="No wallet selected. Create one below." />
        )}
      </MobileSection>

      <MobileSection
        title="Switch wallet"
        description="Jump between wallets for households, trips, or business units."
      >
        {snapshot.wallets.length > 0 ? (
          <div className="space-y-3">
            <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} />
            <p className="text-xs text-slate-500">
              Need advanced controls? <Link href="/wallets" className="font-medium text-slate-900 underline">Open the full wallet manager</Link>.
            </p>
          </div>
        ) : (
          <EmptyState message="No wallets yet. Use the form below to create one." />
        )}
      </MobileSection>

      <MobileSection
        title="Create a wallet"
        description="Spin up focused workspaces with their own currency and team."
      >
        <CreateWalletForm />
      </MobileSection>

      {activeWallet ? (
        <MobileSection tone="plain">
          <WalletTeamManager
            walletId={activeWallet.$id}
            walletName={activeWallet.name}
            team={snapshot.team}
            teamError={snapshot.teamError}
            currentUserId={currentUserId}
          />
        </MobileSection>
      ) : null}
interface BudgetsScreenProps {
  formatter: Intl.NumberFormat;
  summaries: DashboardSnapshot["budgetSummaries"];
  limit: number;
  remaining: number;
}

function BudgetsScreen({ formatter, summaries, limit, remaining }: BudgetsScreenProps) {
  const used = limit ? limit - remaining : 0;
  const overallProgress = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-wide text-white/60">Budget summary</p>
        {limit > 0 ? (
          <div className="mt-2">
            <p className="text-lg font-semibold text-white">{formatter.format(remaining)} remaining</p>
            <p className="text-xs text-white/60">{formatter.format(limit)} total across {summaries.length} budgets</p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/70">Create your first budget to keep spending in check.</p>
        )}
      </div>
      <div className="space-y-3">
        {summaries.length === 0 ? (
          <div className="rounded-3xl bg-white/5 px-5 py-6 text-center text-sm text-white/70">
            No budgets available yet.
          </div>
        ) : (
          summaries.map(summary => {
            const progress = summary.limit > 0 ? Math.min(100, Math.round((summary.spent / summary.limit) * 100)) : 0;
            const remainingValue = formatter.format(summary.remaining);
            return (
              <div key={summary.id} className="space-y-2 rounded-3xl bg-white/5 px-5 py-4">
                <div className="flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">{summary.label}</span>
                  <span className="text-xs text-white/60">{summary.interval}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Spent {formatter.format(summary.spent)}</span>
                  <span>Left {remainingValue}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RecentTransactionsList({
  transactions,
  formatter
}: {
  transactions: DashboardSnapshot["transactions"];
  formatter: Intl.NumberFormat;
}) {
  if (transactions.length === 0) {
    return <p className="text-sm text-slate-600">No transactions recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {transactions.map(transaction => {
        const date = new Date(transaction.occurred_at);
        const formatted = new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric"
        }).format(date);
        const amount = formatter.format(transaction.amount);
        const isExpense = transaction.type === "expense";
        return (
          <li
            key={transaction.$id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{transaction.categoryName ?? "Uncategorised"}</span>
              <span className="text-xs text-slate-500">
                {formatted}
                {transaction.merchant ? ` · ${transaction.merchant}` : ""}
              </span>
            </div>
            <span className={cn("font-semibold", isExpense ? "text-rose-600" : "text-emerald-600")}>{amount}</span>
          </li>
        );
      })}
    </ul>
  );
}

function CategoriesList({
  categories
}: {
  categories: DashboardSnapshot["categories"];
}) {
  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
        No categories yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 text-sm">
      {categories.map(category => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <li
            key={category.$id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60"
                style={{ backgroundColor: category.color ?? "rgba(148, 163, 184, 0.15)" }}
              >
                <Icon className="h-5 w-5 text-slate-700" aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{category.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">{category.type}</span>
              </div>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-400">{category.slug}</span>
          </li>
        );
      })}
    </ul>
  );
}

function StatPill({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClasses: Record<"positive" | "negative" | "neutral", string> = {
    positive: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/40",
    negative: "bg-rose-50 text-rose-700 ring-1 ring-rose-500/40",
    neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-900/10"
  };

  return (
    <div className={cn("rounded-2xl px-4 py-4 text-sm font-semibold shadow-sm", toneClasses[tone])}>
      <p className="text-xs font-medium uppercase tracking-wide text-current/70">{label}</p>
      <p className="mt-1 text-xl leading-tight text-current">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
      {message}
interface TransactionsScreenProps {
  formatter: Intl.NumberFormat;
  transactions: DashboardSnapshot["transactions"];
}

function TransactionsScreen({ formatter, transactions }: TransactionsScreenProps) {
  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="rounded-3xl bg-white/5 px-5 py-10 text-center text-sm text-white/70">No transactions recorded yet.</div>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => {
            const date = new Date(transaction.occurred_at);
            const formattedDate = new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric"
            }).format(date);
            const amount = formatter.format(transaction.amount);
            const isExpense = transaction.type === "expense";
            return (
              <div
                key={transaction.$id}
                className="flex items-center justify-between rounded-3xl bg-white/5 px-5 py-4 text-sm text-white"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{transaction.categoryName ?? "Uncategorised"}</span>
                  <span className="text-xs text-white/60">
                    {formattedDate} {transaction.merchant ? `• ${transaction.merchant}` : ""}
                  </span>
                </div>
                <span className={cn("font-semibold", isExpense ? "text-rose-300" : "text-emerald-300")}>{amount}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MobileSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  tone?: "surface" | "plain";
}

function MobileSection({ title, description, children, tone = "surface" }: MobileSectionProps) {
  if (tone === "plain") {
    return (
      <section className="space-y-3">
        {title || description ? (
          <header className="space-y-1 px-1">
            {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </header>
        ) : null}
        <div>{children}</div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5">
      {title || description ? (
        <header className="space-y-1">
          {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </header>
      ) : null}
      <div className={cn(title || description ? "mt-4" : undefined)}>{children}</div>
    </section>
interface ReportsScreenProps {
  formatter: Intl.NumberFormat;
  pieData: Array<{ name: string; value: number }>;
  totals: DashboardSnapshot["totals"];
}

function ReportsScreen({ formatter, pieData, totals }: ReportsScreenProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/5 px-5 py-5 text-sm text-white/80">
        <p>Total income: <span className="font-semibold text-emerald-200">{formatter.format(totals.income)}</span></p>
        <p>Total expenses: <span className="font-semibold text-rose-200">{formatter.format(Math.abs(totals.expenses))}</span></p>
        <p>Net balance: <span className="font-semibold text-white">{formatter.format(totals.net)}</span></p>
      </div>
      <div className="flex flex-col items-center rounded-3xl bg-white/5 px-5 py-6">
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: 16,
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#f8fafc"
                }}
              />
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 w-full space-y-2 text-xs text-white/70">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span>{entry.name}</span>
              </div>
              <span className="font-semibold text-white/90">{formatter.format(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
