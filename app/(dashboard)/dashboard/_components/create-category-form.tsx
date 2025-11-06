"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAction } from "../actions";
import { initialState } from "../types";
import {
  CATEGORY_COLOR_SWATCHES,
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon
} from "./category-metadata";

interface CreateCategoryFormProps {
  walletId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant: "subtle" }), "w-full sm:w-auto")}
      disabled={pending}
    >
      {pending ? "Saving..." : "Add category"}
    </button>
  );
}

export function CreateCategoryForm({ walletId }: CreateCategoryFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createCategoryAction, initialState);
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");

  const SelectedIcon = useMemo(() => getCategoryIcon(selectedIcon), [selectedIcon]);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("create-category-form") as HTMLFormElement | null;
      form?.reset();
      setCategoryType("expense");
      setSelectedColor("");
      setSelectedIcon("");
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form id="create-category-form" action={formAction} className="space-y-6">
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="type" value={categoryType} />
      <input type="hidden" name="color" value={selectedColor} />
      <input type="hidden" name="icon" value={selectedIcon} />
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
      <div className="grid gap-2">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "expense" as const, label: "Expense" },
              { value: "income" as const, label: "Income" }
            ]
          ).map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategoryType(option.value)}
              className={cn(
                "flex-1 min-w-[120px] rounded-lg border px-4 py-2 text-sm font-medium transition",
                option.value === categoryType
                  ? "border-slate-900 bg-slate-900 text-white shadow"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
              aria-pressed={option.value === categoryType}
            >
              {option.label}
            </button>
          ))}
        </div>
        {state.fieldErrors?.type ? <p className="text-sm text-red-600">{state.fieldErrors.type}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedColor("")}
            className={cn(
              "flex h-10 items-center justify-center rounded-full border px-4 text-xs font-medium uppercase tracking-wide",
              selectedColor === ""
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            Auto
          </button>
          {CATEGORY_COLOR_SWATCHES.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "relative h-10 w-10 rounded-full border-2 border-transparent transition",
                selectedColor === color ? "ring-2 ring-offset-2 ring-slate-900" : "hover:border-slate-300"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Use ${color} as the category color`}
            >
              {selectedColor === color ? <span className="sr-only">Selected</span> : null}
            </button>
          ))}
          <label className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-sm">
            <span>Custom</span>
            <input
              type="color"
              value={selectedColor || "#ffffff"}
              onChange={event => setSelectedColor(event.target.value)}
              className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
              aria-label="Pick a custom color"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">Colors personalize charts and category chips across the dashboard.</p>
        {state.fieldErrors?.color ? <p className="text-sm text-red-600">{state.fieldErrors.color}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          <button
            type="button"
            onClick={() => setSelectedIcon("")}
            className={cn(
              "flex h-12 items-center justify-center rounded-lg border text-xs font-medium transition",
              selectedIcon === ""
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            None
          </button>
          {CATEGORY_ICON_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedIcon(option.value)}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-lg border bg-white text-xs font-medium transition",
                  selectedIcon === option.value
                    ? "border-slate-900 text-slate-900 shadow"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
                aria-pressed={selectedIcon === option.value}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wide">{option.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">Icons make categories instantly recognizable when logging transactions.</p>
        {state.fieldErrors?.icon ? <p className="text-sm text-red-600">{state.fieldErrors.icon}</p> : null}
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <SelectedIcon className="h-5 w-5" aria-hidden="true" />
        <span>
          Categories are shared with your team so everyone files expenses consistently.
        </span>
      </div>
      {state.message ? (
        <p className={cn("text-sm", state.status === "error" ? "text-red-600" : "text-slate-600")}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
