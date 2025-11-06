"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { CategoryDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "../actions";
import { initialState } from "../types";
import { getCategoryIcon } from "./category-metadata";

interface CreateTransactionFormProps {
  walletId: string;
  categories: CategoryDocument[];
  currency: string;
  defaultMerchant?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(buttonVariants(), "w-full sm:w-auto")}
      disabled={pending}
    >
      {pending ? "Saving..." : "Record transaction"}
    </button>
  );
}

const nowLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export function CreateTransactionForm({ walletId, categories, currency, defaultMerchant }: CreateTransactionFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createTransactionAction, initialState);
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-transaction-form") as HTMLFormElement | null;
      form?.reset();
      const occurredAt = document.getElementById("transaction-occurred-at") as HTMLInputElement | null;
      if (occurredAt) {
        occurredAt.value = nowLocal();
      }
      const merchant = document.getElementById("transaction-merchant") as HTMLInputElement | null;
      if (merchant) {
        merchant.value = defaultMerchant ?? "";
      }
      setTransactionType("expense");
      setSelectedCategory("");
      router.refresh();
    }
  }, [state.status, router, defaultMerchant]);

  const expenseCategories = categories.filter(category => category.type === "expense");
  const incomeCategories = categories.filter(category => category.type === "income");
  const visibleCategories = useMemo(() => {
    return transactionType === "income" ? incomeCategories : expenseCategories;
  }, [transactionType, incomeCategories, expenseCategories]);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    const category = categories.find(item => item.$id === selectedCategory);
    if (category && category.type !== transactionType) {
      setSelectedCategory("");
    }
  }, [transactionType, categories, selectedCategory]);

  return (
    <form id="create-transaction-form" action={formAction} className="space-y-6">
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="type" value={transactionType} />
      <input type="hidden" name="categoryId" value={selectedCategory} />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-2">
          <Label>Type</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  value: "expense" as const,
                  title: "Expense",
                  description: "Money leaving the wallet"
                },
                {
                  value: "income" as const,
                  title: "Income",
                  description: "Money coming into the wallet"
                }
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
                <span className="text-sm font-semibold">{option.title}</span>
                <p className="mt-1 text-xs text-current/80">{option.description}</p>
              </button>
            ))}
          </div>
          {state.fieldErrors?.type ? <p className="text-sm text-red-600">{state.fieldErrors.type}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transaction-amount">Amount ({currency})</Label>
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1">
            <span className="px-3 text-sm font-medium text-slate-500">{currency}</span>
            <Input
              id="transaction-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="42.50"
              required
              aria-invalid={Boolean(state.fieldErrors?.amount)}
              className="flex-1 border-0 focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-slate-500">Enter the exact total including taxes or reimbursements.</p>
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
                    selectedCategory === category.$id && category.color
                      ? `${category.color}15`
                      : undefined
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
          <Label htmlFor="transaction-occurred-at">Date</Label>
          <Input
            id="transaction-occurred-at"
            name="occurredAt"
            type="datetime-local"
            defaultValue={nowLocal()}
            required
            aria-invalid={Boolean(state.fieldErrors?.occurredAt)}
          />
          {state.fieldErrors?.occurredAt ? (
            <p className="text-sm text-red-600">{state.fieldErrors.occurredAt}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transaction-merchant">Merchant or payer</Label>
          <Input
            id="transaction-merchant"
            name="merchant"
            placeholder="Vendor or payer"
            defaultValue={defaultMerchant ?? ""}
          />
          {state.fieldErrors?.merchant ? <p className="text-sm text-red-600">{state.fieldErrors.merchant}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="transaction-memo">Memo (optional)</Label>
        <textarea
          id="transaction-memo"
          name="memo"
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
      <SubmitButton />
    </form>
  );
}
