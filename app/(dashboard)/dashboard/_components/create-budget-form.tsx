"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { CategoryDocument } from "@/lib/server/finance-service";
import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBudgetAction } from "../actions";
import { initialState } from "../types";

interface CreateBudgetFormProps {
  walletId: string;
  categories: CategoryDocument[];
  currency: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")} disabled={pending}>
      {pending ? "Saving..." : "Create budget"}
    </button>
  );
}

export function CreateBudgetForm({ walletId, categories, currency }: CreateBudgetFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createBudgetAction, initialState);
  const [categoryId, setCategoryId] = useState<string>("");
  const [budgetInterval, setBudgetInterval] = useState<"monthly" | "quarterly" | "yearly" | "custom">("monthly");
  const [rollover, setRollover] = useState<boolean>(false);

  const expenseCategories = useMemo(() => categories.filter(category => category.type === "expense"), [categories]);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-budget-form") as HTMLFormElement | null;
      form?.reset();
      setCategoryId("");
      setBudgetInterval("monthly");
      setRollover(false);
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form id="create-budget-form" action={formAction} className="space-y-5">
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="interval" value={budgetInterval} />
      <input type="hidden" name="rollover" value={rollover ? "on" : ""} />
      <div className="grid gap-2">
        <Label htmlFor="budget-limit">Spending limit ({currency})</Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1">
          <span className="px-3 text-sm font-medium text-slate-500">{currency}</span>
          <Input
            id="budget-limit"
            name="limit"
            type="number"
            min="0"
            step="0.01"
            placeholder="1200"
            aria-invalid={Boolean(state.fieldErrors?.limit)}
            className="flex-1 border-0 focus-visible:ring-0"
            required
          />
        </div>
        {state.fieldErrors?.limit ? <p className="text-sm text-red-600">{state.fieldErrors.limit}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label>Applies to</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId("")}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide",
              categoryId === "" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            Entire wallet
          </button>
          {expenseCategories.length === 0 ? (
            <span className="rounded-full border border-dashed border-slate-200 px-4 py-2 text-xs text-slate-500">
              Create an expense category first.
            </span>
          ) : null}
          {expenseCategories.map(category => (
            <button
              key={category.$id}
              type="button"
              onClick={() => setCategoryId(category.$id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                categoryId === category.$id
                  ? "border-slate-900 bg-slate-900 text-white shadow"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
        {state.fieldErrors?.categoryId ? <p className="text-sm text-red-600">{state.fieldErrors.categoryId}</p> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label>Interval</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { value: "monthly" as const, label: "Monthly" },
                { value: "quarterly" as const, label: "Quarterly" },
                { value: "yearly" as const, label: "Yearly" },
                { value: "custom" as const, label: "Custom" }
              ]
            ).map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudgetInterval(option.value)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition",
                  budgetInterval === option.value
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
                aria-pressed={budgetInterval === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget-rollover" className="flex items-center gap-2">
            <input
              id="budget-rollover"
              name="rolloverToggle"
              type="checkbox"
              checked={rollover}
              onChange={event => setRollover(event.target.checked)}
              className="h-4 w-4 rounded border border-slate-300"
            />
            Enable rollover
          </Label>
          <p className="text-xs text-slate-500">
            Roll unspent funds into the next interval to reward under-budget spending.
          </p>
        </div>
      </div>
      {state.message ? (
        <p className={cn("text-sm", state.status === "error" ? "text-red-600" : "text-emerald-600")}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
