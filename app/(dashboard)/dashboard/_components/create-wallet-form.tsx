"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWalletAction, initialState } from "../actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={cn(buttonVariants(), "w-full sm:w-auto")} disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CreateWalletForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(createWalletAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-wallet-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form id="create-wallet-form" action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Wallet name</Label>
        <Input id="name" name="name" placeholder="Family wallet" required aria-invalid={Boolean(state.fieldErrors?.name)} />
        {state.fieldErrors?.name ? (
          <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="defaultCurrency">Default currency</Label>
          <Input
            id="defaultCurrency"
            name="defaultCurrency"
            placeholder="USD"
            defaultValue="USD"
            maxLength={3}
            required
            className="uppercase"
            aria-invalid={Boolean(state.fieldErrors?.defaultCurrency)}
          />
          {state.fieldErrors?.defaultCurrency ? (
            <p className="text-sm text-red-600">{state.fieldErrors.defaultCurrency}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthlyBudget">Monthly budget (optional)</Label>
          <Input
            id="monthlyBudget"
            name="monthlyBudget"
            type="number"
            min="0"
            step="0.01"
            placeholder="1500"
            aria-invalid={Boolean(state.fieldErrors?.monthlyBudget)}
          />
          {state.fieldErrors?.monthlyBudget ? (
            <p className="text-sm text-red-600">{state.fieldErrors.monthlyBudget}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ownerTeamId">Owner team id (optional)</Label>
        <Input
          id="ownerTeamId"
          name="ownerTeamId"
          placeholder="appwrite team id"
          aria-invalid={Boolean(state.fieldErrors?.ownerTeamId)}
        />
        {state.fieldErrors?.ownerTeamId ? (
          <p className="text-sm text-red-600">{state.fieldErrors.ownerTeamId}</p>
        ) : null}
      </div>
      {state.message ? (
        <p className={cn("text-sm", state.status === "error" ? "text-red-600" : "text-slate-600")}>{state.message}</p>
      ) : null}
      <SubmitButton label="Create wallet" />
    </form>
  );
}
