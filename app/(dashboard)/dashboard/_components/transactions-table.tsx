"use client";

import { useMemo } from "react";

import type { CategoryDocument, TransactionDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { deleteTransactionAction } from "../actions";
import { getCategoryIcon } from "./category-metadata";

interface TransactionsTableProps {
  walletId: string;
  currency: string;
  transactions: (TransactionDocument & { categoryName: string | null })[];
  categories: CategoryDocument[];
}

const formatter = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

const typeStyles: Record<string, string> = {
  income: "bg-emerald-50 text-emerald-700 ring-emerald-500/40",
  expense: "bg-rose-50 text-rose-700 ring-rose-500/40"
};

export function TransactionsTable({ walletId, currency, transactions, categories }: TransactionsTableProps) {
  const categoriesById = useMemo(() => {
    return new Map(categories.map(category => [category.$id, category]));
  }, [categories]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        No transactions yet. Record one to kick off the analytics.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <caption className="sr-only">Recent transactions</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {transactions.map(transaction => (
            <tr key={transaction.$id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 text-slate-600">
                {new Date(transaction.occurred_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                    typeStyles[transaction.type]
                  )}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {(() => {
                  const category = transaction.category_id
                    ? categoriesById.get(transaction.category_id)
                    : null;
                  const Icon = getCategoryIcon(category?.icon);
                  return (
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-slate-700"
                        style={{
                          backgroundColor: category?.color ? `${category.color}12` : "#f8fafc",
                          borderColor: category?.color ?? "#e2e8f0"
                        }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {category?.name ?? transaction.categoryName ?? "Uncategorised"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {category?.type === "income" ? "Income" : category?.type === "expense" ? "Expense" : "General"}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </td>
              <td className="px-4 py-3 text-slate-500">
                <div className="max-w-xs space-y-1">
                  <p className="text-sm text-slate-600">
                    {transaction.memo ?? "No memo added."}
                  </p>
                  {transaction.merchant ? (
                    <p className="text-xs uppercase tracking-wide text-slate-400">Merchant: {transaction.merchant}</p>
                  ) : null}
                </div>
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold",
                  transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatter(currency, transaction.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <form
                  action={deleteTransactionAction}
                  onSubmit={event => {
                    const allow = window.confirm("Remove this transaction?");
                    if (!allow) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="walletId" value={walletId} />
                  <input type="hidden" name="transactionId" value={transaction.$id} />
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
