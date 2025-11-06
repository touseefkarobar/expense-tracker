import { AppwriteException, ID, Models, Query } from "node-appwrite";
import { cache } from "react";

import { databases } from "./appwrite";
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

export interface DashboardSnapshot {
  wallets: WalletDocument[];
  activeWalletId: string | null;
  categories: CategoryDocument[];
  transactions: (TransactionDocument & { categoryName: string | null })[];
  totals: DashboardTotals;
  categorySummaries: CategorySummary[];
}

const COLLECTIONS = {
  wallets: "wallets",
  categories: "categories",
  transactions: "transactions"
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
      categorySummaries: []
    };
  }

  const [categories, transactions] = await Promise.all([
    listCategories(activeWalletId),
    listTransactions(activeWalletId)
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

  return {
    wallets,
    activeWalletId,
    categories,
    transactions: augmentedTransactions,
    totals,
    categorySummaries
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

export async function deleteTransaction(walletId: string, transactionId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.transactions, transactionId);
  } catch (error) {
    throw new Error(`Unable to delete transaction: ${formatAppwriteError(error)}`);
  }
}
