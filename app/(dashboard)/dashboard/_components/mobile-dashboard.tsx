"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  Minus,
  PiggyBank,
  PieChart,
  Plus,
  Receipt,
  Repeat,
  Settings as SettingsIcon,
  Tags,
  Wallet2
} from "lucide-react";

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
interface ComposerOptions {
  transactionType?: "expense" | "income";
}

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
 
const SCREEN_TITLES: Record<Exclude<Screen, "overview">, string> = {
  transactions: "Bills & Receipts",
  categories: "Categories",
  budgets: "Budgets",
  reports: "Reports",
  wallets: "Wallets & Team"
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
  const [composerOptions, setComposerOptions] = useState<ComposerOptions | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }),
    [currency]
  );

  const recentTransactions = snapshot.transactions.slice(0, 8);
  const canMutateWallet = Boolean(snapshot.activeWalletId);

  const handleComposer = (type: ComposerType, options?: ComposerOptions) => {
    if (!canMutateWallet && type !== "wallet") {
      return;
    }
    setComposer(type);
    setComposerOptions(options ?? null);
  };

  let detailContent: ReactNode | null = null;
  let detailTitle: string | null = null;
  if (screen !== "overview") {
    detailTitle = SCREEN_TITLES[screen as Exclude<Screen, "overview">];
    switch (screen) {
      case "transactions":
        detailContent = (
          <TransactionsScreen
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            currency={currency}
            transactions={snapshot.transactions}
            onCreateTransaction={() => handleComposer("transaction")}
            formatter={formatter}
          />
        );
        break;
      case "categories":
        detailContent = (
          <CategoriesScreen
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            onCreateCategory={() => handleComposer("category")}
          />
        );
        break;
      case "budgets":
        detailContent = (
          <BudgetsScreen
            walletId={snapshot.activeWalletId}
            categories={snapshot.categories}
            currency={currency}
            budgets={snapshot.budgetSummaries}
            onCreateBudget={() => handleComposer("budget")}
          />
        );
        break;
      case "reports":
        detailContent = (
          <ReportsScreen
            formatter={formatter}
            totals={snapshot.totals}
            categories={snapshot.categorySummaries}
            currency={currency}
          />
        );
        break;
      case "wallets":
        detailContent = (
          <WalletsScreen
            snapshot={snapshot}
            activeWallet={activeWallet}
            currency={currency}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
            onCreateWallet={() => handleComposer("wallet")}
          />
        );
        break;
      default:
        detailContent = null;
    }
  }

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
            initialType={composerOptions?.transactionType ?? "expense"}
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

  const settingsItems: Array<{ label: string; onClick: () => void }> = [
    { label: "Wallets & team", onClick: () => setScreen("wallets") },
    { label: "Categories", onClick: () => setScreen("categories") },
    { label: "Budgets", onClick: () => setScreen("budgets") },
    { label: "Reports", onClick: () => setScreen("reports") }
  ];

  return (
    <div className="flex w-full justify-center bg-slate-900 px-2 py-6 sm:px-6">
      <div className="w-full max-w-sm space-y-3">
        {loadError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
            {loadError}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-[32px] bg-black text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
          {screen === "overview" ? (
            <OverviewScreen
              formatter={formatter}
              totals={snapshot.totals}
              budgets={snapshot.budgetSummaries}
              transactions={recentTransactions}
              currency={currency}
              walletName={activeWallet?.name ?? null}
              onNavigate={setScreen}
              onComposer={handleComposer}
              onSettings={() => setSettingsOpen(true)}
              canMutateWallet={canMutateWallet}
              currentUserName={currentUserName}
            />
          ) : detailContent && detailTitle ? (
            <DetailShell title={detailTitle} onBack={() => setScreen("overview")}>
              {detailContent}
            </DetailShell>
          ) : null}
        </div>
      </div>

      <MobileSheet
        open={Boolean(composer)}
        onClose={() => {
          setComposer(null);
          setComposerOptions(null);
        }}
        title={composer ? COMPOSER_COPY[composer].title : ""}
        description={composer ? COMPOSER_COPY[composer].description : undefined}
      >
        {composerContent ?? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
            Select or create a wallet to use this action.
          </div>
        )}
      </MobileSheet>

      <MobileSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Quick settings"
        description="Jump to detailed controls without leaving the dashboard."
      >
        <div className="space-y-3">
          {settingsItems.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                item.onClick();
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <span>{item.label}</span>
              <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" aria-hidden="true" />
            </button>
          ))}
          <div className="rounded-2xl bg-slate-50 p-3 text-left">{logoutControl}</div>
        </div>
      </MobileSheet>
    </div>
  );
}
interface OverviewScreenProps {
  formatter: Intl.NumberFormat;
  totals: DashboardSnapshot["totals"];
  budgets: DashboardSnapshot["budgetSummaries"];
  transactions: DashboardSnapshot["transactions"];
  currency: string;
  walletName: string | null;
  onNavigate: (screen: Screen) => void;
  onComposer: (type: ComposerType, options?: ComposerOptions) => void;
  onSettings: () => void;
  canMutateWallet: boolean;
  currentUserName: string | null;
}

function OverviewScreen({
  formatter,
  totals,
  budgets,
  transactions,
  currency,
  walletName,
  onNavigate,
  onComposer,
  onSettings,
  canMutateWallet,
  currentUserName
}: OverviewScreenProps) {
  const budget = budgets[0] ?? null;
  const limit = budget?.limit ?? 0;
  const spent = budget?.spent ?? Math.abs(totals.expenses);
  const remaining = budget ? budget.remaining : totals.net;
  const progress = limit > 0 ? Math.min(spent / limit, 1) : 0;
  const billsCount = transactions.length;
  const netLabel = totals.net >= 0 ? "You are in surplus" : "Spending is over income";

  return (
    <div className="grid min-h-[640px] grid-cols-3 grid-flow-dense gap-3 bg-black px-5 py-5 text-white">
      <MetroTile color="bg-sky-500" colSpan={2} rowSpan={2}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            <Wallet2 className="h-5 w-5" aria-hidden="true" />
            <span>Account</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold">{formatter.format(totals.net)}</p>
            <p className="text-sm text-white/80">{walletName ?? "No wallet selected"}</p>
            <p className="text-xs text-white/70">{currentUserName ? `Owner: ${currentUserName}` : "Invite teammates"}</p>
          </div>
        </div>
      </MetroTile>

      <MetroTile
        color="bg-emerald-500"
        rowSpan={1}
        disabled={!canMutateWallet}
        onClick={() => onComposer("transaction", { transactionType: "income" })}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-white/80">
            <span>Income</span>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-semibold">{formatter.format(totals.income)}</p>
        </div>
      </MetroTile>

      <MetroTile
        color="bg-rose-500"
        rowSpan={1}
        disabled={!canMutateWallet}
        onClick={() => onComposer("transaction", { transactionType: "expense" })}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-white/80">
            <span>Expenses</span>
            <Minus className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-semibold">{formatter.format(Math.abs(totals.expenses))}</p>
        </div>
      </MetroTile>

      <MetroTile color="bg-amber-500" colSpan={3} rowSpan={1}>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/80">
          <span>Budget</span>
          <span>{budget ? `${formatter.format(Math.max(remaining, 0))} left` : "No budget"}</span>
        </div>
        <p className="mt-1 text-lg font-semibold">
          {budget ? `${formatter.format(spent)} of ${formatter.format(limit || spent)}` : `Expenses ${formatter.format(Math.abs(totals.expenses))}`}
        </p>
        <div className="mt-3 h-3 rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>{formatter.format(spent)}</span>
          <span>{budget ? formatter.format(limit) : currency}</span>
        </div>
      </MetroTile>

      <MetroTile
        color="bg-fuchsia-500"
        colSpan={2}
        onClick={() => onNavigate("transactions")}
        disabled={!canMutateWallet}
      >
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          <span>Bills & receipts</span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{billsCount === 0 ? "No activity" : `${billsCount} recent`}</p>
      </MetroTile>

      <MetroTile color="bg-lime-500" onClick={() => onNavigate("reports")}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            <PieChart className="h-4 w-4" aria-hidden="true" />
            <span>Reports</span>
          </div>
          <p className="text-2xl font-semibold">View</p>
        </div>
      </MetroTile>

      <div className="col-span-3">
        <QuickActionRow
          disabled={!canMutateWallet}
          onTransaction={() => onComposer("transaction")}
          onCategories={() => onNavigate("categories")}
          onWallets={() => onNavigate("wallets")}
          onSchedule={() => onNavigate("transactions")}
        />
      </div>

      <MetroTile color="bg-slate-700" colSpan={2} rowSpan={1}>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
          <Activity className="h-4 w-4" aria-hidden="true" />
          <span>Summary</span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{formatter.format(totals.net)}</p>
        <p className="text-sm text-white/80">{netLabel}</p>
      </MetroTile>

      <MetroTile color="bg-slate-500" onClick={onSettings}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            <SettingsIcon className="h-4 w-4" aria-hidden="true" />
            <span>Settings</span>
          </div>
          <p className="text-2xl font-semibold">Open</p>
        </div>
      </MetroTile>
    </div>
  );
}

interface MetroTileProps {
  color: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function MetroTile({ color, colSpan = 1, rowSpan = 1, children, onClick, disabled }: MetroTileProps) {
  const colClasses: Record<1 | 2 | 3, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3"
  };
  const rowClasses: Record<1 | 2, string> = {
    1: "row-span-1",
    2: "row-span-2"
  };

  const Component: "button" | "div" = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={cn(
        "rounded-2xl p-4 text-left shadow-inner shadow-black/30",
        color,
        colClasses[colSpan],
        rowClasses[rowSpan],
        onClick ? "transition active:scale-[0.98]" : undefined,
        disabled ? "opacity-50" : undefined
      )}
    >
      {children}
    </Component>
  );
}

interface QuickActionRowProps {
  disabled: boolean;
  onTransaction: () => void;
  onCategories: () => void;
  onWallets: () => void;
  onSchedule: () => void;
}

function QuickActionRow({ disabled, onTransaction, onCategories, onWallets, onSchedule }: QuickActionRowProps) {
  const actions = [
    { label: "Add", icon: Plus, color: "bg-emerald-500", handler: onTransaction },
    { label: "Categories", icon: Tags, color: "bg-rose-500", handler: onCategories },
    { label: "Wallets", icon: Repeat, color: "bg-sky-500", handler: onWallets },
    { label: "Schedule", icon: CalendarDays, color: "bg-purple-500", handler: onSchedule }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(action => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.handler}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-white",
              action.color,
              disabled ? "opacity-50" : "shadow-lg shadow-black/20"
            )}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DetailShell({ title, children, onBack }: { title: string; children: ReactNode; onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4 text-white">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">Menu</p>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto bg-slate-50 px-5 pb-6 pt-4 text-slate-900">{children}</div>
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
            <span className={cn("font-semibold", isExpense ? "text-rose-600" : "text-emerald-600")}
            >
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
