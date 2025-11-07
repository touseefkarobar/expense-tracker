"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CreditCard, LayoutDashboard, LineChart, PiggyBank, Tags, Wallet2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
        const formatted = format(date, "MMM d");
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
  );
}
