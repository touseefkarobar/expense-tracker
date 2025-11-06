"use client";

import { Fragment, useMemo, useState } from "react";

import type { CategoryDocument, TransactionDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { deleteTransactionAction } from "../actions";
import { EditTransactionForm } from "./edit-transaction-form";
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

const typeLabels: Record<"all" | "income" | "expense", string> = {
  all: "All",
  income: "Income",
  expense: "Expenses"
};

export function TransactionsTable({ walletId, currency, transactions, categories }: TransactionsTableProps) {
  const categoriesById = useMemo(() => new Map(categories.map(category => [category.$id, category])), [categories]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [expenseSort, setExpenseSort] = useState<"date-desc" | "date-asc" | "category">("date-desc");
  const [editingId, setEditingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const transaction of transactions) {
      if (transaction.type === "income") {
        income += 1;
      } else {
        expense += 1;
      }
    }
    return { total: transactions.length, income, expense };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const base =
      typeFilter === "all" ? transactions : transactions.filter(transaction => transaction.type === typeFilter);

    if (typeFilter !== "expense") {
      return base;
    }

    const sorted = [...base];
    if (expenseSort === "category") {
      sorted.sort((a, b) => {
        const nameA = a.category_id
          ? categoriesById.get(a.category_id)?.name ?? a.categoryName ?? ""
          : a.categoryName ?? "";
        const nameB = b.category_id
          ? categoriesById.get(b.category_id)?.name ?? b.categoryName ?? ""
          : b.categoryName ?? "";
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
      });
      return sorted;
    }

    sorted.sort((a, b) => {
      const aTime = new Date(a.occurred_at).getTime();
      const bTime = new Date(b.occurred_at).getTime();
      return expenseSort === "date-asc" ? aTime - bTime : bTime - aTime;
    });
    return sorted;
  }, [transactions, typeFilter, expenseSort, categoriesById]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        No transactions yet. Record one to kick off the analytics.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(typeLabels) as Array<"all" | "income" | "expense">).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setTypeFilter(option);
                setEditingId(null);
              }}
              className={cn(
                buttonVariants({ variant: option === typeFilter ? "secondary" : "ghost", size: "sm" }),
                option === typeFilter
                  ? "border-slate-300 bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
              aria-pressed={typeFilter === option}
            >
              {typeLabels[option]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          <span>Total {counts.total}</span>
          <span className="text-emerald-600">Income {counts.income}</span>
          <span className="text-rose-600">Expenses {counts.expense}</span>
        </div>
      </div>

      {typeFilter === "expense" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-semibold uppercase tracking-wide text-slate-500">Sort expenses by</span>
          {(
            [
              { value: "date-desc" as const, label: "Newest" },
              { value: "date-asc" as const, label: "Oldest" },
              { value: "category" as const, label: "Category" }
            ]
          ).map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setExpenseSort(option.value)}
              className={cn(
                buttonVariants({ variant: expenseSort === option.value ? "secondary" : "ghost", size: "sm" }),
                expenseSort === option.value
                  ? "border-slate-300 bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
              aria-pressed={expenseSort === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

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
            {filteredTransactions.map(transaction => {
              const category = transaction.category_id ? categoriesById.get(transaction.category_id) ?? null : null;
              const Icon = getCategoryIcon(category?.icon);
              const isEditing = editingId === transaction.$id;

              return (
                <Fragment key={transaction.$id}>
                  <tr className={cn("align-top transition", isEditing ? "bg-slate-50" : "hover:bg-slate-50/60")}
                  >
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(transaction.occurred_at).toLocaleDateString()}
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
                            {category?.type === "income"
                              ? "Income"
                              : category?.type === "expense"
                              ? "Expense"
                              : "General"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="max-w-xs space-y-1">
                        <p className="text-sm text-slate-600">{transaction.memo ?? "No memo added."}</p>
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
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : transaction.$id)}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-500 hover:text-slate-800")}
                        >
                          {isEditing ? "Close" : "Edit"}
                        </button>
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
                              "text-rose-600 hover:bg-rose-50"
                            )}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  {isEditing ? (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-6 pb-6">
                        <EditTransactionForm
                          walletId={walletId}
                          currency={currency}
                          categories={categories}
                          transaction={transaction}
                          onClose={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
