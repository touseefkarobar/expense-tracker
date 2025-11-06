import { AppwriteException, ID, Models, Query } from "node-appwrite";
import { cache } from "react";

import { databases, teams } from "./appwrite";
import { DATABASE_ID } from "./database-schema";

type AppwriteDocument<T> = T &
  Pick<
    Models.Document,
    "$id" | "$collectionId" | "$databaseId" | "$createdAt" | "$updatedAt" | "$permissions" | "$sequence"
  >;

export type WalletDocument = AppwriteDocument<{
  name: string;
  default_currency: string;
  owner_team_id?: string | null;
  monthly_budget?: number | null;
}>;

export type CategoryType = "expense" | "income";

export type CategoryDocument = AppwriteDocument<{
  wallet_id: string;
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
}>;

export type TransactionDocument = AppwriteDocument<{
  wallet_id: string;
  amount: number;
  type: CategoryType;
  category_id: string | null;
  occurred_at: string;
  memo?: string | null;
  merchant?: string | null;
}>;

export type BudgetInterval = "monthly" | "quarterly" | "yearly" | "custom";

export type BudgetDocument = AppwriteDocument<{
  wallet_id: string;
  category_id?: string | null;
  interval: BudgetInterval;
  limit: number;
  rollover?: boolean | null;
  alert_thresholds?: number[] | null;
}>;

export interface CategorySummary {
  id: string;
  name: string;
  type: CategoryType;
  total: number;
}

export interface DashboardTotals {
  income: number;
  expenses: number;
  net: number;
}

export interface BudgetSummary {
  id: string;
  label: string;
  interval: BudgetInterval;
  limit: number;
  spent: number;
  remaining: number;
  categoryId: string | null;
}

export interface DashboardSnapshot {
  wallets: WalletDocument[];
  activeWalletId: string | null;
  categories: CategoryDocument[];
  transactions: (TransactionDocument & { categoryName: string | null })[];
  totals: DashboardTotals;
  categorySummaries: CategorySummary[];
  budgets: BudgetDocument[];
  budgetSummaries: BudgetSummary[];
  team: {
    id: string;
    memberships: Models.Membership[];
  } | null;
  teamError: string | null;
}

const COLLECTIONS = {
  wallets: "wallets",
  categories: "categories",
  transactions: "transactions",
  budgets: "budgets"
} as const;

const formatAppwriteError = (error: unknown) => {
  if (error instanceof AppwriteException) {
    return `${error.message} (Appwrite code ${error.code})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};

async function listWallets(): Promise<WalletDocument[]> {
  try {
    const result = await databases.listDocuments<WalletDocument>(
      DATABASE_ID,
      COLLECTIONS.wallets,
      [Query.orderAsc("name"), Query.limit(200)]
    );
    return result.documents;
  } catch (error) {
    throw new Error(`Unable to list wallets: ${formatAppwriteError(error)}`);
  }
}

async function listCategories(walletId: string): Promise<CategoryDocument[]> {
  try {
    const result = await databases.listDocuments<CategoryDocument>(
      DATABASE_ID,
      COLLECTIONS.categories,
      [Query.equal("wallet_id", walletId), Query.orderAsc("name"), Query.limit(200)]
    );
    return result.documents;
  } catch (error) {
    throw new Error(`Unable to list categories: ${formatAppwriteError(error)}`);
  }
}

async function listTransactions(walletId: string): Promise<TransactionDocument[]> {
  try {
    const result = await databases.listDocuments<TransactionDocument>(
      DATABASE_ID,
      COLLECTIONS.transactions,
      [
        Query.equal("wallet_id", walletId),
        Query.orderDesc("occurred_at"),
        Query.limit(200)
      ]
    );
    return result.documents;
  } catch (error) {
    throw new Error(`Unable to list transactions: ${formatAppwriteError(error)}`);
  }
}

async function listBudgets(walletId: string): Promise<BudgetDocument[]> {
  try {
    const result = await databases.listDocuments<BudgetDocument>(
      DATABASE_ID,
      COLLECTIONS.budgets,
      [Query.equal("wallet_id", walletId), Query.limit(200)]
    );
    return result.documents;
  } catch (error) {
    throw new Error(`Unable to list budgets: ${formatAppwriteError(error)}`);
  }
}

async function getWallet(walletId: string): Promise<WalletDocument> {
  try {
    const document = await databases.getDocument<WalletDocument>(
      DATABASE_ID,
      COLLECTIONS.wallets,
      walletId
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to load wallet: ${formatAppwriteError(error)}`);
  }
}

async function assignWalletTeamId(walletId: string, teamId: string): Promise<WalletDocument> {
  try {
    const document = await databases.updateDocument<WalletDocument>(
      DATABASE_ID,
      COLLECTIONS.wallets,
      walletId,
      {
        owner_team_id: teamId
      }
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to link team to wallet: ${formatAppwriteError(error)}`);
  }
}

export const getDashboardSnapshot = cache(async (walletId?: string | null): Promise<DashboardSnapshot> => {
  const wallets = await listWallets();
  const activeWalletId = walletId ?? wallets[0]?.$id ?? null;

  if (!activeWalletId) {
    return {
      wallets,
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

  const activeWallet = wallets.find(wallet => wallet.$id === activeWalletId);

  const [categories, transactions, budgets] = await Promise.all([
    listCategories(activeWalletId),
    listTransactions(activeWalletId),
    listBudgets(activeWalletId)
  ]);

  const categoryMap = new Map<string, CategoryDocument>();
  categories.forEach(category => categoryMap.set(category.$id, category));

  const augmentedTransactions = transactions.map(transaction => ({
    ...transaction,
    categoryName: transaction.category_id ? categoryMap.get(transaction.category_id)?.name ?? null : null
  }));

  const totals = augmentedTransactions.reduce<DashboardTotals>(
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

  const categoryTotals = new Map<string, CategorySummary>();

  augmentedTransactions.forEach(transaction => {
    if (!transaction.category_id) {
      return;
    }
    const category = categoryMap.get(transaction.category_id);
    if (!category) {
      return;
    }

    const current = categoryTotals.get(transaction.category_id) ?? {
      id: category.$id,
      name: category.name,
      type: category.type,
      total: 0
    };

    current.total += transaction.amount;
    categoryTotals.set(transaction.category_id, current);
  });

  const categorySummaries = Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total);

  const budgetSummaries: BudgetSummary[] = budgets.map(budget => {
    const isCategoryBudget = Boolean(budget.category_id);
    const relevantTransactions = augmentedTransactions.filter(transaction => {
      if (transaction.type !== "expense") {
        return false;
      }
      if (!isCategoryBudget) {
        return true;
      }
      return transaction.category_id === budget.category_id;
    });

    const spent = relevantTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const remaining = budget.limit - spent;
    const category = isCategoryBudget && budget.category_id ? categoryMap.get(budget.category_id) : null;

    return {
      id: budget.$id,
      label: category ? category.name : "Whole wallet",
      interval: budget.interval,
      limit: budget.limit,
      spent,
      remaining,
      categoryId: category ? category.$id : null
    };
  });

  let team: DashboardSnapshot["team"] = null;
  let teamError: string | null = null;

  if (activeWallet?.owner_team_id) {
    try {
      const memberships = await teams.listMemberships(activeWallet.owner_team_id);
      team = { id: activeWallet.owner_team_id, memberships: memberships.memberships };
    } catch (error) {
      teamError = `Unable to load team members: ${formatAppwriteError(error)}`;
    }
  }

  return {
    wallets,
    activeWalletId,
    categories,
    transactions: augmentedTransactions,
    totals,
    categorySummaries,
    budgets,
    budgetSummaries,
    team,
    teamError
  };
});

export interface CreateWalletInput {
  name: string;
  defaultCurrency: string;
  ownerTeamId?: string | null;
  monthlyBudget?: number | null;
}

export async function createWallet(input: CreateWalletInput): Promise<WalletDocument> {
  const payload = {
    name: input.name,
    default_currency: input.defaultCurrency,
    owner_team_id: input.ownerTeamId ?? null,
    monthly_budget: input.monthlyBudget ?? null
  };

  try {
    const document = await databases.createDocument<WalletDocument>(
      DATABASE_ID,
      COLLECTIONS.wallets,
      ID.unique(),
      payload
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to create wallet: ${formatAppwriteError(error)}`);
  }
}

export async function linkWalletToTeam(walletId: string, teamId: string): Promise<WalletDocument> {
  return assignWalletTeamId(walletId, teamId);
}

export async function fetchWallet(walletId: string): Promise<WalletDocument> {
  return getWallet(walletId);
}

export interface CreateCategoryInput {
  walletId: string;
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDocument> {
  const payload = {
    wallet_id: input.walletId,
    name: input.name,
    type: input.type,
    color: input.color ?? null,
    icon: input.icon ?? null
  };

  try {
    const document = await databases.createDocument<CategoryDocument>(
      DATABASE_ID,
      COLLECTIONS.categories,
      ID.unique(),
      payload
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to create category: ${formatAppwriteError(error)}`);
  }
}

export interface CreateTransactionInput {
  walletId: string;
  type: CategoryType;
  categoryId: string | null;
  amount: number;
  occurredAt: string;
  memo?: string | null;
  merchant?: string | null;
}

export async function createTransaction(input: CreateTransactionInput): Promise<TransactionDocument> {
  const payload = {
    wallet_id: input.walletId,
    type: input.type,
    category_id: input.categoryId,
    amount: input.amount,
    occurred_at: input.occurredAt,
    memo: input.memo ?? null,
    merchant: input.merchant ?? null
  };

  try {
    const document = await databases.createDocument<TransactionDocument>(
      DATABASE_ID,
      COLLECTIONS.transactions,
      ID.unique(),
      payload
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to create transaction: ${formatAppwriteError(error)}`);
  }
}

export interface UpdateTransactionInput {
  walletId: string;
  transactionId: string;
  type: CategoryType;
  categoryId: string | null;
  amount: number;
  occurredAt: string;
  memo?: string | null;
  merchant?: string | null;
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<TransactionDocument> {
  const payload = {
    wallet_id: input.walletId,
    type: input.type,
    category_id: input.categoryId,
    amount: input.amount,
    occurred_at: input.occurredAt,
    memo: input.memo ?? null,
    merchant: input.merchant ?? null
  };

  try {
    const document = await databases.updateDocument<TransactionDocument>(
      DATABASE_ID,
      COLLECTIONS.transactions,
      input.transactionId,
      payload
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to update transaction: ${formatAppwriteError(error)}`);
  }
}

export async function deleteTransaction(walletId: string, transactionId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.transactions, transactionId);
  } catch (error) {
    throw new Error(`Unable to delete transaction: ${formatAppwriteError(error)}`);
  }
}

export interface CreateBudgetInput {
  walletId: string;
  categoryId: string | null;
  interval: BudgetInterval;
  limit: number;
  rollover: boolean;
}

export async function createBudget(input: CreateBudgetInput): Promise<BudgetDocument> {
  const payload = {
    wallet_id: input.walletId,
    category_id: input.categoryId,
    interval: input.interval,
    limit: input.limit,
    rollover: input.rollover,
    alert_thresholds: null
  };

  try {
    const document = await databases.createDocument<BudgetDocument>(
      DATABASE_ID,
      COLLECTIONS.budgets,
      ID.unique(),
      payload
    );
    return document;
  } catch (error) {
    throw new Error(`Unable to create budget: ${formatAppwriteError(error)}`);
  }
}
