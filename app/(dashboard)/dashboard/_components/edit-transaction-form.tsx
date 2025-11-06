"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { CategoryDocument, TransactionDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTransactionAction } from "../actions";
import { initialState } from "../types";
import { getCategoryIcon } from "./category-metadata";

interface EditTransactionFormProps {
  walletId: string;
  currency: string;
  categories: CategoryDocument[];
  transaction: TransactionDocument & { categoryName: string | null };
  onClose: () => void;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")}
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

const toDateInput = (value: string) => value.slice(0, 10);

export function EditTransactionForm({ walletId, currency, categories, transaction, onClose }: EditTransactionFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateTransactionAction, initialState);
  const [transactionType, setTransactionType] = useState<"expense" | "income">(transaction.type);
  const [selectedCategory, setSelectedCategory] = useState<string>(transaction.category_id ?? "");

  const expenseCategories = useMemo(() => categories.filter(category => category.type === "expense"), [categories]);
  const incomeCategories = useMemo(() => categories.filter(category => category.type === "income"), [categories]);

  const visibleCategories = transactionType === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onClose();
    }
  }, [state.status, onClose, router]);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    const category = categories.find(item => item.$id === selectedCategory);
    if (category && category.type !== transactionType) {
      setSelectedCategory("");
    }
  }, [transactionType, categories, selectedCategory]);

  const dateValue = toDateInput(transaction.occurred_at);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="transactionId" value={transaction.$id} />
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="type" value={transactionType} />
      <input type="hidden" name="categoryId" value={selectedCategory} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Type</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { value: "expense" as const, label: "Expense", description: "Money leaving the wallet" },
                { value: "income" as const, label: "Income", description: "Money coming into the wallet" }
              ]
            ).map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTransactionType(option.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  option.value === transactionType
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
                aria-pressed={option.value === transactionType}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <p className="mt-1 text-xs text-current/80">{option.description}</p>
              </button>
            ))}
          </div>
          {state.fieldErrors?.type ? <p className="text-sm text-red-600">{state.fieldErrors.type}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`transaction-amount-${transaction.$id}`}>Amount ({currency})</Label>
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1">
            <span className="px-3 text-sm font-medium text-slate-500">{currency}</span>
            <Input
              id={`transaction-amount-${transaction.$id}`}
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={transaction.amount}
              required
              aria-invalid={Boolean(state.fieldErrors?.amount)}
              className="flex-1 border-0 focus-visible:ring-0"
            />
          </div>
          {state.fieldErrors?.amount ? <p className="text-sm text-red-600">{state.fieldErrors.amount}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select a category">
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide",
              selectedCategory === ""
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <span>Uncategorised</span>
          </button>
          {visibleCategories.length === 0 ? (
            <span className="rounded-full border border-dashed border-slate-200 px-4 py-2 text-xs text-slate-500">
              No {transactionType} categories yet.
            </span>
          ) : null}
          {visibleCategories.map(category => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <button
                key={category.$id}
                type="button"
                onClick={() => setSelectedCategory(category.$id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  selectedCategory === category.$id
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
                style={{
                  borderColor: selectedCategory === category.$id && category.color ? category.color : undefined,
                  backgroundColor:
                    selectedCategory === category.$id && category.color ? `${category.color}15` : undefined
                }}
                aria-pressed={selectedCategory === category.$id}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40"
                  style={{ backgroundColor: category.color ?? "rgba(148, 163, 184, 0.2)" }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
        {state.fieldErrors?.categoryId ? <p className="text-sm text-red-600">{state.fieldErrors.categoryId}</p> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`transaction-occurred-${transaction.$id}`}>Date</Label>
          <Input
            id={`transaction-occurred-${transaction.$id}`}
            name="occurredAt"
            type="date"
            defaultValue={dateValue}
            required
            aria-invalid={Boolean(state.fieldErrors?.occurredAt)}
          />
          {state.fieldErrors?.occurredAt ? <p className="text-sm text-red-600">{state.fieldErrors.occurredAt}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`transaction-merchant-${transaction.$id}`}>Merchant or payer</Label>
          <Input
            id={`transaction-merchant-${transaction.$id}`}
            name="merchant"
            defaultValue={transaction.merchant ?? ""}
            placeholder="Vendor or payer"
          />
          {state.fieldErrors?.merchant ? <p className="text-sm text-red-600">{state.fieldErrors.merchant}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`transaction-memo-${transaction.$id}`}>Memo (optional)</Label>
        <textarea
          id={`transaction-memo-${transaction.$id}`}
          name="memo"
          defaultValue={transaction.memo ?? ""}
          className="min-h-[96px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          placeholder="Where did this transaction come from? Share details for the team."
        />
        {state.fieldErrors?.memo ? <p className="text-sm text-red-600">{state.fieldErrors.memo}</p> : null}
      </div>
      {state.message ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-2 text-sm",
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {state.message}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label="Save changes" />
        <button
          type="button"
          onClick={onClose}
          className={cn(buttonVariants({ variant: "ghost" }), "text-slate-600 hover:text-slate-900")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
