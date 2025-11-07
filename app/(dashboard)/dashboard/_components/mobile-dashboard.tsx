"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Plus,
  Tags,
  Wallet2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DashboardSnapshot, WalletDocument } from "@/lib/server/finance-service";
import { cn } from "@/lib/utils/cn";
import { MobileSheet } from "@/components/ui/mobile-sheet";

import { BudgetOverview } from "./budget-overview";
import { CategorySummary } from "./category-summary";
import { CreateBudgetForm } from "./create-budget-form";
import { CreateCategoryForm } from "./create-category-form";
import { CreateTransactionForm } from "./create-transaction-form";
import { CreateWalletForm } from "./create-wallet-form";
import { getCategoryIcon } from "./category-metadata";
import { WalletSelector } from "./wallet-selector";
import { WalletTeamManager } from "./wallet-team-manager";

type Screen = "overview" | "transactions" | "categories" | "budgets" | "reports" | "wallets";
type ComposerType = "transaction" | "category" | "budget" | "wallet";

const NAV_ITEMS: Array<{ id: Screen; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "budgets", label: "Budgets", icon: PiggyBank },
  { id: "reports", label: "Reports", icon: LineChart },
  { id: "wallets", label: "Wallets", icon: Wallet2 }
];

const COMPOSER_COPY: Record<ComposerType, { title: string; description: string }> = {
  transaction: {
    title: "Record income or expense",
    description: "Keep the shared wallet updated in a couple of taps."
  },
  category: {
    title: "Create a category",
    description: "Label spending buckets so the whole team stays aligned."
  },
  budget: {
    title: "Create a budget",
    description: "Set guardrails and track burn without leaving your phone."
  },
  wallet: {
    title: "Create a wallet",
    description: "Spin up a workspace with its own currency, team, and budgets."
  }
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
  const [composer, setComposer] = useState<ComposerType | null>(null);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }),
    [currency]
  );

  const [todayLabel] = useState(() => format(new Date(), "EEE, MMM d"));
  const recentTransactions = snapshot.transactions.slice(0, 8);
  const canMutateWallet = Boolean(snapshot.activeWalletId);

  const composerContent = (() => {
    if (!composer) {
      return null;
    }

    if (!snapshot.activeWalletId && composer !== "wallet") {
      return null;
    }

    switch (composer) {
      case "transaction":
        if (!snapshot.activeWalletId) {
          return null;
        }
        return (
          <CreateTransactionForm
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            currency={currency}
          />
        );
      case "category":
        if (!snapshot.activeWalletId) {
          return null;
        }
        return <CreateCategoryForm walletId={snapshot.activeWalletId} />;
      case "budget":
        if (!snapshot.activeWalletId) {
          return null;
        }
        return <CreateBudgetForm walletId={snapshot.activeWalletId} categories={snapshot.categories} currency={currency} />;
      case "wallet":
        return <CreateWalletForm />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex w-full justify-center bg-slate-900/5 px-2 py-4 sm:px-6">
      <div className="relative flex w-full max-w-md flex-1 flex-col overflow-hidden rounded-[40px] bg-slate-950 text-white shadow-[0_35px_60px_-15px_rgba(15,23,42,0.7)] ring-1 ring-slate-900/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_rgba(15,23,42,0.2)_55%,_rgba(15,23,42,1)_90%)]" />
        <header className="relative z-10 px-6 pb-6 pt-8">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
            <span>{todayLabel}</span>
            <span>{currency}</span>
          </div>
          <div className="mt-6 space-y-5">
            <div className="space-y-1">
              <p className="text-sm text-white/70">{currentUserName ? `Hi, ${currentUserName.split(" ")[0]}` : "Welcome"}</p>
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold leading-tight">
                  {activeWallet?.name ?? "Create a wallet"}
                </h1>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:bg-white/10"
                  onClick={() => setScreen("wallets")}
                  aria-label="Manage wallets"
                >
                  <Wallet2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="text-xs text-white/60">
                {snapshot.wallets.length} wallet{snapshot.wallets.length === 1 ? "" : "s"} available
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 px-5 py-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
                <span>Net balance</span>
                <span>{activeWallet?.default_currency ?? currency}</span>
              </div>
              <p className="mt-2 text-3xl font-semibold">{formatter.format(snapshot.totals.net)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
                <div className="rounded-2xl bg-emerald-400/15 px-4 py-3 text-emerald-200">
                  <p className="text-xs uppercase tracking-wide text-emerald-100/90">Income</p>
                  <p className="text-lg">{formatter.format(snapshot.totals.income)}</p>
                </div>
                <div className="rounded-2xl bg-rose-400/15 px-4 py-3 text-rose-200">
                  <p className="text-xs uppercase tracking-wide text-rose-100/90">Expenses</p>
                  <p className="text-lg">{formatter.format(Math.abs(snapshot.totals.expenses))}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {loadError ? (
          <div className="relative z-10 mx-5 mb-3 rounded-2xl border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-50">
            {loadError}
          </div>
        ) : null}

        <main className="relative z-10 flex-1 overflow-hidden rounded-t-[32px] bg-slate-50 text-slate-900">
          <ScreenContainer>
            {screen === "overview" ? (
              <OverviewScreen
                formatter={formatter}
                totals={snapshot.totals}
                budgets={snapshot.budgetSummaries}
                categories={snapshot.categorySummaries}
                transactions={recentTransactions}
                onNavigate={setScreen}
                onComposer={type => {
                  if (!canMutateWallet && type !== "wallet") {
                    return;
                  }
                  setComposer(type);
                }}
                canMutateWallet={canMutateWallet}
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
                onCreateTransaction={() => {
                  if (!canMutateWallet) {
                    return;
                  }
                  setComposer("transaction");
                }}
                formatter={formatter}
              />
            ) : null}
            {screen === "categories" ? (
              <CategoriesScreen
                walletId={snapshot.activeWalletId}
                categories={snapshot.categories}
                onCreateCategory={() => {
                  if (!canMutateWallet) {
                    return;
                  }
                  setComposer("category");
                }}
              />
            ) : null}
            {screen === "budgets" ? (
              <BudgetsScreen
                walletId={snapshot.activeWalletId}
                categories={snapshot.categories}
                currency={currency}
                budgets={snapshot.budgetSummaries}
                onCreateBudget={() => {
                  if (!canMutateWallet) {
                    return;
                  }
                  setComposer("budget");
                }}
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
                onCreateWallet={() => setComposer("wallet")}
              />
            ) : null}
          </ScreenContainer>
        </main>

        <ActionDock
          onTransaction={() => {
            if (!canMutateWallet) {
              return;
            }
            setComposer("transaction");
          }}
          onCategory={() => {
            if (!canMutateWallet) {
              return;
            }
            setComposer("category");
          }}
          onBudget={() => {
            if (!canMutateWallet) {
              return;
            }
            setComposer("budget");
          }}
          onWallet={() => setComposer("wallet")}
          disabled={!canMutateWallet}
        />

        <BottomNav current={screen} onNavigate={setScreen} />
      </div>

      <MobileSheet
        open={Boolean(composer)}
        onClose={() => setComposer(null)}
        title={composer ? COMPOSER_COPY[composer].title : ""}
        description={composer ? COMPOSER_COPY[composer].description : undefined}
      >
        {composerContent ?? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
            Select or create a wallet to use this action.
          </div>
        )}
      </MobileSheet>
    </div>
  );
}

function ScreenContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4">{children}</div>
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
  onComposer: (type: ComposerType) => void;
  canMutateWallet: boolean;
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
  onComposer,
  canMutateWallet,
  logoutControl,
  currency,
  currentUserName
}: OverviewScreenProps) {
  const netIsPositive = totals.net >= 0;
  const quickActions: Array<{
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    tone?: "primary";
    disabled?: boolean;
  }> = [
    { label: "Record transaction", icon: CreditCard, onPress: () => onComposer("transaction"), tone: "primary", disabled: !canMutateWallet },
    { label: "Categories", icon: Tags, onPress: () => onNavigate("categories"), disabled: !canMutateWallet },
    { label: "Budgets", icon: PiggyBank, onPress: () => onNavigate("budgets"), disabled: !canMutateWallet },
    { label: "Wallets", icon: Wallet2, onPress: () => onNavigate("wallets") }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Net position</p>
          <p className="mt-2 text-3xl font-semibold">{formatter.format(totals.net)}</p>
          <p className="mt-1 text-sm text-white/70">{netIsPositive ? "You are in the green." : "Spending outpaces income."}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatPill label="Income" value={formatter.format(totals.income)} tone="positive" />
          <StatPill label="Expenses" value={formatter.format(Math.abs(totals.expenses))} tone="negative" />
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
              onClick={action.onPress}
              disabled={action.disabled}
              className={cn(
                "flex min-h-[92px] flex-col justify-between rounded-3xl px-4 py-4 text-left shadow-lg transition",
                isPrimary
                  ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-900/10 hover:ring-slate-900/20",
                action.disabled ? "opacity-40" : undefined
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
        scrollAreaMaxHeight={320}
      >
        <BudgetOverview budgets={budgets} currency={currency} />
      </MobileSection>

      <MobileSection
        title="Category breakdown"
        description="See which buckets drive income and expenses."
        scrollAreaMaxHeight={320}
      >
        <CategorySummary summaries={categories} currency={currency} />
      </MobileSection>

      <MobileSection title="Recent activity" description="Latest transactions across the wallet." scrollAreaMaxHeight={280}>
        <RecentTransactionsList formatter={formatter} transactions={transactions} />
      </MobileSection>

      <MobileSection title="Account" description="Signed in user" tone="plain">
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
  onCreateTransaction: () => void;
  formatter: Intl.NumberFormat;
}

function TransactionsScreen({
  walletId,
  categories,
  currency,
  transactions,
  onCreateTransaction,
  formatter
}: TransactionsScreenProps) {
  if (!walletId) {
    return (
      <EmptyState
        message="Create or select a wallet to record income and expenses."
        action={
          <p className="text-xs text-slate-500">
            Head to the wallets tab to get started.
          </p>
        }
      />
    );
  }

  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return (
    <div className="space-y-6">
      <MobileSection title="Record a transaction" description="Log shared spending with a focused composer.">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Use quick actions or open the sheet for more context.</p>
          <button
            type="button"
            onClick={onCreateTransaction}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-transparent transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New record
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatPill label="Income" value={formatter.format(totals.income)} tone="positive" />
          <StatPill label="Expenses" value={formatter.format(Math.abs(totals.expenses))} tone="negative" />
        </div>
      </MobileSection>

      <MobileSection
        title="Timeline"
        description="Swipe the list to revisit recent entries."
        scrollAreaMaxHeight={360}
      >
        <RecentTransactionsList formatter={formatter} transactions={transactions} />
      </MobileSection>
    </div>
  );
}

interface CategoriesScreenProps {
  walletId: string | null;
  categories: DashboardSnapshot["categories"];
  onCreateCategory: () => void;
}

function CategoriesScreen({ walletId, categories, onCreateCategory }: CategoriesScreenProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  if (!walletId) {
    return <EmptyState message="Pick a wallet before curating categories." />;
  }

  const filteredCategories =
    filter === "all" ? categories : categories.filter(category => category.type === filter);

  return (
    <div className="space-y-6">
      <MobileSection title="Create category" description="Organise budgets with simple, shareable tags.">
        <button
          type="button"
          onClick={onCreateCategory}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New category
        </button>
      </MobileSection>

      <MobileSection
        title="Existing categories"
        description="Filter by type and scroll through a focused list."
        scrollAreaMaxHeight={360}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              { value: "all" as const, label: "All" },
              { value: "expense" as const, label: "Expenses" },
              { value: "income" as const, label: "Income" }
            ]
          ).map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                filter === option.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <CategoriesList categories={filteredCategories} compact />
      </MobileSection>
    </div>
  );
}

interface BudgetsScreenProps {
  walletId: string | null;
  categories: DashboardSnapshot["categories"];
  currency: string;
  budgets: DashboardSnapshot["budgetSummaries"];
  onCreateBudget: () => void;
}

function BudgetsScreen({ walletId, categories, currency, budgets, onCreateBudget }: BudgetsScreenProps) {
  if (!walletId) {
    return <EmptyState message="Select a wallet to start budgeting." />;
  }

  return (
    <div className="space-y-6">
      <MobileSection title="Create budget" description="Set spending limits per category or wallet.">
        <button
          type="button"
          onClick={onCreateBudget}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New budget
        </button>
      </MobileSection>

      <MobileSection
        title="Budget health"
        description="Scroll the cards to track burn at a glance."
        scrollAreaMaxHeight={360}
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
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Income" value={formatter.format(totals.income)} tone="positive" />
          <StatPill label="Expenses" value={formatter.format(Math.abs(totals.expenses))} tone="negative" />
          <StatPill label="Net" value={formatter.format(totals.net)} tone="neutral" />
        </div>
      </MobileSection>
      <MobileSection
        title="Category summary"
        description="Totals roll up by category so you can spot the highest spend or income streams."
        scrollAreaMaxHeight={360}
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
  onCreateWallet: () => void;
}

function WalletsScreen({
  snapshot,
  activeWallet,
  currency,
  currentUserName,
  currentUserId,
  onCreateWallet
}: WalletsScreenProps) {
  return (
    <div className="space-y-6">
      <MobileSection
        title="Switch wallet"
        description="Jump between households, trips, or business units."
        scrollAreaMaxHeight={220}
      >
        {snapshot.wallets.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active wallet</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{activeWallet?.name ?? "Not selected"}</p>
              <p className="text-xs text-slate-500">
                Currency {activeWallet?.default_currency ?? currency}
              </p>
            </div>
            <WalletSelector wallets={snapshot.wallets} activeWalletId={snapshot.activeWalletId} />
            <p className="text-xs text-slate-500">
              Need advanced controls?{" "}
              <Link href="/wallets" className="font-medium text-slate-900 underline">
                Open the full wallet manager
              </Link>
              .
            </p>
          </div>
        ) : (
          <EmptyState
            message="No wallets yet."
            action={
              <button
                type="button"
                onClick={onCreateWallet}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create wallet
              </button>
            }
          />
        )}
      </MobileSection>

      <MobileSection title="Create a wallet" description="Spin up focused workspaces with their own currency and team.">
        <button
          type="button"
          onClick={onCreateWallet}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New wallet
        </button>
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
        const Icon = isExpense ? ArrowDownRight : ArrowUpRight;

        return (
          <li
            key={transaction.$id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl",
                  isExpense ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{transaction.categoryName ?? "Uncategorised"}</span>
                <span className="text-xs text-slate-500">
                  {formatted}
                  {transaction.merchant ? ` · ${transaction.merchant}` : ""}
                </span>
              </div>
            </div>
            <span className={cn("font-semibold", isExpense ? "text-rose-600" : "text-emerald-600")}>
              {isExpense ? "-" : "+"}
              {amount}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function CategoriesList({
  categories,
  compact = false
}: {
  categories: DashboardSnapshot["categories"];
  compact?: boolean;
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
            className={cn(
              "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
              compact ? "text-sm" : "text-base"
            )}
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

function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500">
      <p>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

interface MobileSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  tone?: "surface" | "plain";
  scrollAreaMaxHeight?: number;
}

function MobileSection({ title, description, children, tone = "surface", scrollAreaMaxHeight }: MobileSectionProps) {
  const content = scrollAreaMaxHeight ? (
    <div className="overflow-y-auto pr-1" style={{ maxHeight: scrollAreaMaxHeight }}>
      {children}
    </div>
  ) : (
    <div>{children}</div>
  );

  if (tone === "plain") {
    return (
      <section className="space-y-3">
        {title || description ? (
          <header className="space-y-1 px-1">
            {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </header>
        ) : null}
        {content}
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
      <div className={cn(title || description ? "mt-4" : undefined)}>{content}</div>
    </section>
  );
}

interface ActionDockProps {
  onTransaction: () => void;
  onCategory: () => void;
  onBudget: () => void;
  onWallet: () => void;
  disabled: boolean;
}

function ActionDock({ onTransaction, onCategory, onBudget, onWallet, disabled }: ActionDockProps) {
  const actions = [
    { label: "Transaction", icon: CreditCard, onClick: onTransaction, disabled },
    { label: "Category", icon: Tags, onClick: onCategory, disabled },
    { label: "Budget", icon: PiggyBank, onClick: onBudget, disabled },
    { label: "Wallet", icon: Wallet2, onClick: onWallet, disabled: false }
  ];

  return (
    <div className="relative z-20 px-5 pt-3">
      <div className="grid grid-cols-4 gap-2 rounded-[28px] bg-slate-950/95 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-white/80 shadow-xl shadow-slate-900/40">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition",
                action.disabled ? "opacity-40" : "hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <nav className="relative z-20 px-4 pb-4 pt-3">
      <div className="flex items-center justify-between rounded-[30px] border border-slate-200/60 bg-white/90 px-3 py-2 shadow-xl shadow-slate-950/10 backdrop-blur">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-semibold transition",
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              )}
              aria-pressed={isActive}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
