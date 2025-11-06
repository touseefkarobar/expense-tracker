"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CreateBudgetInput,
  CreateCategoryInput,
  CreateTransactionInput,
  CreateWalletInput,
  UpdateTransactionInput,
  createBudget,
  createCategory,
  createTransaction,
  createWallet,
  deleteTransaction,
  updateTransaction
} from "@/lib/server/finance-service";
import { addTeamMemberToWallet, attachExistingTeamToWallet, createTeamForWallet } from "@/lib/server/team-service";
import type { ActionState } from "./types";

const walletSchema = z.object({
  name: z.string().min(2, "Enter a name with at least 2 characters."),
  defaultCurrency: z.string().min(3, "Provide a 3-letter currency code."),
  ownerTeamId: z.string().min(1).optional().or(z.literal("")),
  monthlyBudget: z
    .string()
    .optional()
    .transform(value => (value ? Number(value) : undefined))
    .pipe(z.number().nonnegative("Budget must be positive.").optional())
});

const categorySchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["expense", "income"], { required_error: "Choose category type." }),
  color: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(value => !value || /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value), {
      message: "Use a valid hex color like #22c55e."
    }),
  icon: z.string().max(64, "Icon name is too long.").optional().or(z.literal(""))
});

const dateOnly = z
  .string()
  .min(1, "Provide a date.")
  .refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use a valid date in YYYY-MM-DD format."
  })
  .superRefine((value, ctx) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a valid date."
      });
    }
  })
  .transform(value => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
  });

const transactionSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  type: z.enum(["expense", "income"]),
  categoryId: z.string().optional().or(z.literal("")).transform(value => value || null),
  amount: z
    .string({ required_error: "Amount is required." })
    .refine(value => !Number.isNaN(Number(value)), { message: "Enter a numeric amount." })
    .transform(value => Number(value))
    .refine(value => value > 0, { message: "Amount must be greater than zero." }),
  occurredAt: dateOnly,
  memo: z.string().optional().or(z.literal("")),
  merchant: z.string().optional().or(z.literal(""))
});

const updateTransactionSchema = transactionSchema.extend({
  transactionId: z.string().min(1, "Missing transaction id.")
});

const deleteTransactionSchema = z.object({
  walletId: z.string().min(1),
  transactionId: z.string().min(1)
});

const budgetSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  categoryId: z.string().optional().or(z.literal("")).transform(value => value || null),
  limit: z
    .string({ required_error: "Budget limit is required." })
    .refine(value => !Number.isNaN(Number(value)), { message: "Enter a numeric limit." })
    .transform(value => Number(value))
    .refine(value => value > 0, { message: "Budget must be greater than zero." }),
  interval: z.enum(["monthly", "quarterly", "yearly", "custom"]),
  rollover: z.string().optional().transform(value => value === "on")
});

const createTeamSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  teamName: z.string().min(2, "Team name must be at least 2 characters.")
});

const attachTeamSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  teamId: z.string().min(1, "Enter an Appwrite team ID.")
});

const addMemberSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  userId: z.string().min(1, "Select a user."),
  role: z.enum(["owner", "member", "viewer"], {
    required_error: "Choose a role."
  })
});

function mapZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (!result[path]) {
      result[path] = issue.message;
    }
  }
  return result;
}

export async function createWalletAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = walletSchema.safeParse({
    name: formData.get("name"),
    defaultCurrency: formData.get("defaultCurrency"),
    ownerTeamId: formData.get("ownerTeamId"),
    monthlyBudget: formData.get("monthlyBudget")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  const input: CreateWalletInput = parsed.data;

  try {
    await createWallet(input);
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { status: "success", message: `Wallet "${input.name}" created.` };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create wallet."
    };
  }
}

export async function createCategoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    walletId: formData.get("walletId"),
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  const input: CreateCategoryInput = {
    ...parsed.data,
    color: parsed.data.color || null,
    icon: parsed.data.icon || null
  };

  try {
    await createCategory(input);
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { status: "success", message: "Category created." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create category."
    };
  }
}

export async function createTransactionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = transactionSchema.safeParse({
    walletId: formData.get("walletId"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    occurredAt: formData.get("occurredAt"),
    memo: formData.get("memo"),
    merchant: formData.get("merchant")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  const input: CreateTransactionInput = {
    walletId: parsed.data.walletId,
    type: parsed.data.type,
    categoryId: parsed.data.categoryId,
    amount: parsed.data.amount,
    occurredAt: parsed.data.occurredAt,
    memo: parsed.data.memo || null,
    merchant: parsed.data.merchant || null
  };

  try {
    await createTransaction(input);
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { status: "success", message: "Transaction recorded." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save transaction."
    };
  }
}

export async function updateTransactionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = updateTransactionSchema.safeParse({
    transactionId: formData.get("transactionId"),
    walletId: formData.get("walletId"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    occurredAt: formData.get("occurredAt"),
    memo: formData.get("memo"),
    merchant: formData.get("merchant")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  const input: UpdateTransactionInput = {
    transactionId: parsed.data.transactionId,
    walletId: parsed.data.walletId,
    type: parsed.data.type,
    categoryId: parsed.data.categoryId,
    amount: parsed.data.amount,
    occurredAt: parsed.data.occurredAt,
    memo: parsed.data.memo || null,
    merchant: parsed.data.merchant || null
  };

  try {
    await updateTransaction(input);
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { status: "success", message: "Transaction updated." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update transaction."
    };
  }
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  const parsed = deleteTransactionSchema.safeParse({
    walletId: formData.get("walletId"),
    transactionId: formData.get("transactionId")
  });

  if (!parsed.success) {
    redirect("/dashboard");
  }

  try {
    await deleteTransaction(parsed.data.walletId, parsed.data.transactionId);
  } catch (error) {
    console.error("deleteTransactionAction", error);
  } finally {
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    redirect(`/dashboard?wallet=${parsed.data.walletId}`);
  }
}

export async function createBudgetAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = budgetSchema.safeParse({
    walletId: formData.get("walletId"),
    categoryId: formData.get("categoryId"),
    limit: formData.get("limit"),
    interval: formData.get("interval"),
    rollover: formData.get("rollover")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  const input: CreateBudgetInput = {
    walletId: parsed.data.walletId,
    categoryId: parsed.data.categoryId,
    limit: parsed.data.limit,
    interval: parsed.data.interval,
    rollover: parsed.data.rollover ?? false
  };

  try {
    await createBudget(input);
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { status: "success", message: "Budget saved." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save budget."
    };
  }
}

export async function createWalletTeamAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = createTeamSchema.safeParse({
    walletId: formData.get("walletId"),
    teamName: formData.get("teamName")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  try {
    await createTeamForWallet(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { status: "success", message: "Team created and linked to wallet." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create team."
    };
  }
}

export async function attachTeamToWalletAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = attachTeamSchema.safeParse({
    walletId: formData.get("walletId"),
    teamId: formData.get("teamId")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  try {
    await attachExistingTeamToWallet(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { status: "success", message: "Team linked to wallet." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to link team."
    };
  }
}

export async function addTeamMemberAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = addMemberSchema.safeParse({
    walletId: formData.get("walletId"),
    userId: formData.get("userId"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  try {
    await addTeamMemberToWallet(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { status: "success", message: "Team member added." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add member."
    };
  }
}
