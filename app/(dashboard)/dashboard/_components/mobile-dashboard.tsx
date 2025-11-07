"use client";

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
  loadError: string | null;
  logoutControl: ReactNode;
}

export function MobileDashboard({
  snapshot,
  activeWallet,
  currency,
  currentUserName,
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
