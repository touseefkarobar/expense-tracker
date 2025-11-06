"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { CategoryDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "../actions";
import { initialState } from "../types";

interface CreateTransactionFormProps {
  walletId: string;
  categories: CategoryDocument[];
  currency: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={cn(buttonVariants({ variant: "ghost" }))} disabled={pending}>
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

export function CreateTransactionForm({ walletId, categories, currency }: CreateTransactionFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createTransactionAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-transaction-form") as HTMLFormElement | null;
      form?.reset();
      const occurredAt = document.getElementById("transaction-occurred-at") as HTMLInputElement | null;
      if (occurredAt) {
        occurredAt.value = nowLocal();
      }
      router.refresh();
    }
  }, [state.status, router]);

  const expenseCategories = categories.filter(category => category.type === "expense");
  const incomeCategories = categories.filter(category => category.type === "income");

  return (
    <form id="create-transaction-form" action={formAction} className="space-y-4">
      <input type="hidden" name="walletId" value={walletId} />
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="transaction-type">Type</Label>
          <select
            id="transaction-type"
            name="type"
            defaultValue="expense"
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            aria-invalid={Boolean(state.fieldErrors?.type)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {state.fieldErrors?.type ? <p className="text-sm text-red-600">{state.fieldErrors.type}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transaction-amount">Amount ({currency})</Label>
          <Input
            id="transaction-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="42.50"
            required
            aria-invalid={Boolean(state.fieldErrors?.amount)}
          />
          {state.fieldErrors?.amount ? <p className="text-sm text-red-600">{state.fieldErrors.amount}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="transaction-category">Category</Label>
        <select
          id="transaction-category"
          name="categoryId"
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          aria-invalid={Boolean(state.fieldErrors?.categoryId)}
          defaultValue=""
        >
          <option value="">Uncategorised</option>
          {expenseCategories.length > 0 ? (
            <optgroup label="Expense categories">
              {expenseCategories.map(category => (
                <option key={category.$id} value={category.$id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {incomeCategories.length > 0 ? (
            <optgroup label="Income categories">
              {incomeCategories.map(category => (
                <option key={category.$id} value={category.$id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
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
          <Label htmlFor="transaction-merchant">Merchant (optional)</Label>
          <Input id="transaction-merchant" name="merchant" placeholder="Vendor or payer" />
          {state.fieldErrors?.merchant ? <p className="text-sm text-red-600">{state.fieldErrors.merchant}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="transaction-memo">Memo (optional)</Label>
        <textarea
          id="transaction-memo"
          name="memo"
          className="min-h-[72px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          placeholder="Add context for the team…"
        />
        {state.fieldErrors?.memo ? <p className="text-sm text-red-600">{state.fieldErrors.memo}</p> : null}
      </div>
      {state.message ? (
        <p className={cn("text-sm", state.status === "error" ? "text-red-600" : "text-slate-600")}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
