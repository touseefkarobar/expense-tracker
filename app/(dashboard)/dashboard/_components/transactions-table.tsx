"use client";

import type { TransactionDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { deleteTransactionAction } from "../actions";

interface TransactionsTableProps {
  walletId: string;
  currency: string;
  transactions: (TransactionDocument & { categoryName: string | null })[];
}

const formatter = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export function TransactionsTable({ walletId, currency, transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        No transactions yet. Record one to kick off the analytics.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Memo</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {transactions.map(transaction => (
            <tr key={transaction.$id} className="hover:bg-slate-50/40">
              <td className="px-4 py-3 text-slate-600">
                {new Date(transaction.occurred_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                    transaction.type === "income"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  )}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{transaction.categoryName ?? "Uncategorised"}</td>
              <td className="px-4 py-3 text-slate-500">{transaction.memo ?? transaction.merchant ?? "—"}</td>
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
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-500 hover:text-slate-700")}
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
