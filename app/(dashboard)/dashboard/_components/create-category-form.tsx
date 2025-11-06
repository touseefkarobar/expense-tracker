"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAction } from "../actions";
import { initialState } from "../types";

interface CreateCategoryFormProps {
  walletId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={cn(buttonVariants({ variant: "outline" }))} disabled={pending}>
      {pending ? "Saving..." : "Add category"}
    </button>
  );
}

export function CreateCategoryForm({ walletId }: CreateCategoryFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createCategoryAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-category-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form id="create-category-form" action={formAction} className="space-y-4">
      <input type="hidden" name="walletId" value={walletId} />
      <div className="grid gap-2">
        <Label htmlFor="category-name">Category name</Label>
        <Input
          id="category-name"
          name="name"
          placeholder="Groceries"
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name ? <p className="text-sm text-red-600">{state.fieldErrors.name}</p> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category-type">Type</Label>
          <select
            id="category-type"
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
          <Label htmlFor="category-color">Color (optional)</Label>
          <Input id="category-color" name="color" placeholder="#7c3aed" />
          {state.fieldErrors?.color ? <p className="text-sm text-red-600">{state.fieldErrors.color}</p> : null}
        </div>
      </div>
      {state.message ? (
        <p className={cn("text-sm", state.status === "error" ? "text-red-600" : "text-slate-600")}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
