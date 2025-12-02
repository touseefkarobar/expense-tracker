import type {
  BudgetDocument,
  CategoryDocument,
  CategorySummary,
  DashboardSnapshot,
  DashboardTotals,
  TransactionDocument,
  WalletDocument
} from "@/lib/server/finance-service";
import { getDashboardSnapshot } from "@/lib/server/finance-service";
import { getCurrentAccount } from "@/lib/server/session";

export interface DashboardDataResult {
  snapshot: DashboardSnapshot;
  loadError: string | null;
  currentUser: { id: string | null; displayName: string | null };
  activeWallet: WalletDocument | null;
  currency: string;
  selectedMonth: string;
  selectedMonthLabel: string;
}

const emptySnapshot: DashboardSnapshot = {
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

const formatMonthLabel = (monthValue: string) => {
  const [year, month] = monthValue.split("-").map(part => Number.parseInt(part, 10));
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const isSameMonth = (timestamp: string, monthValue: string) => {
  const date = new Date(timestamp);
  const [year, month] = monthValue.split("-").map(part => Number.parseInt(part, 10));
  return date.getFullYear() === year && date.getMonth() === month - 1;
};

const deriveTotals = (transactions: TransactionDocument[]): DashboardTotals => {
  return transactions.reduce(
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
};

const deriveCategorySummaries = (
  transactions: (TransactionDocument & { categoryName: string | null })[],
  categories: CategoryDocument[]
): CategorySummary[] => {
  const categoriesById = new Map(categories.map(category => [category.$id, category]));
  const summaries = new Map<string, CategorySummary>();

  for (const transaction of transactions) {
    const category = transaction.category_id ? categoriesById.get(transaction.category_id) : null;
    const id = category?.$id ?? transaction.category_id ?? transaction.categoryName ?? transaction.$id;
    const name = category?.name ?? transaction.categoryName ?? (transaction.type === "income" ? "Income" : "Expense");
    const key = `${transaction.type}-${id}`;
    const existing = summaries.get(key);
    const nextTotal = (existing?.total ?? 0) + transaction.amount;
    summaries.set(key, {
      id: String(id),
      name,
      type: transaction.type,
      total: nextTotal
    });
  }

  return Array.from(summaries.values()).sort((a, b) => b.total - a.total);
};

const deriveBudgetSummaries = (
  budgets: BudgetDocument[],
  categories: CategoryDocument[],
  transactions: TransactionDocument[]
) => {
  const categoryById = new Map(categories.map(category => [category.$id, category]));

  return budgets.map(budget => {
    const spent = transactions
      .filter(transaction => {
        if (transaction.type !== "expense") return false;
        if (!budget.category_id) return true;
        return transaction.category_id === budget.category_id;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);

    const label = budget.category_id
      ? categoryById.get(budget.category_id)?.name ?? "Category budget"
      : "Wallet budget";

    return {
      id: budget.$id,
      label,
      interval: budget.interval,
      limit: budget.limit,
      spent,
      remaining: budget.limit - spent,
      categoryId: budget.category_id ?? null
    };
  });
};

const getSelectedMonth = (rawMonth?: string | null) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (!rawMonth) {
    return currentMonth;
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)) {
    return currentMonth;
  }

  return rawMonth;
};

export async function loadDashboardData(searchParams: { wallet?: string; month?: string }): Promise<DashboardDataResult> {
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
    snapshot = emptySnapshot;
  }

  const activeWallet =
    snapshot.wallets.find(wallet => wallet.$id === snapshot.activeWalletId) ?? snapshot.wallets[0] ?? null;
  const currency = activeWallet?.default_currency ?? "USD";
  const selectedMonth = getSelectedMonth(searchParams.month);
  const monthLabel = formatMonthLabel(selectedMonth);

  const filteredTransactions = snapshot.transactions.filter(transaction =>
    isSameMonth(transaction.occurred_at, selectedMonth)
  );
  const totals = deriveTotals(filteredTransactions);
  const categorySummaries = deriveCategorySummaries(filteredTransactions, snapshot.categories);
  const budgetSummaries = deriveBudgetSummaries(snapshot.budgets, snapshot.categories, filteredTransactions);

  const snapshotWithFilters: DashboardSnapshot = {
    ...snapshot,
    transactions: filteredTransactions,
    totals,
    categorySummaries,
    budgetSummaries
  };

  return {
    snapshot: snapshotWithFilters,
    loadError,
    currentUser,
    activeWallet,
    currency,
    selectedMonth,
    selectedMonthLabel: monthLabel
  };
}

export const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
