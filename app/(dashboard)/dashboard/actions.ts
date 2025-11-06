"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CreateCategoryInput,
  CreateTransactionInput,
  CreateWalletInput,
  createCategory,
  createTransaction,
  createWallet,
  deleteTransaction
} from "@/lib/server/finance-service";
import {
  attachExistingTeamToWallet,
  createTeamForWallet,
  inviteTeamMemberToWallet
} from "@/lib/server/team-service";
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

const transactionSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  type: z.enum(["expense", "income"]),
  categoryId: z.string().optional().or(z.literal("")).transform(value => value || null),
  amount: z
    .string({ required_error: "Amount is required." })
    .refine(value => !Number.isNaN(Number(value)), { message: "Enter a numeric amount." })
    .transform(value => Number(value))
    .refine(value => value > 0, { message: "Amount must be greater than zero." }),
  occurredAt: z
    .string()
    .min(1, "Provide a date.")
    .refine(value => !Number.isNaN(Date.parse(value)), { message: "Use a valid date/time." })
    .transform(value => new Date(value).toISOString()),
  memo: z.string().optional().or(z.literal("")),
  merchant: z.string().optional().or(z.literal(""))
});

const deleteTransactionSchema = z.object({
  walletId: z.string().min(1),
  transactionId: z.string().min(1)
});

const createTeamSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  teamName: z.string().min(2, "Team name must be at least 2 characters.")
});

const attachTeamSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  teamId: z.string().min(1, "Enter an Appwrite team ID.")
});

const inviteMemberSchema = z.object({
  walletId: z.string().min(1, "Missing wallet id."),
  email: z.string().email("Enter a valid email address."),
  name: z.string().optional().or(z.literal("")),
  role: z.enum(["owner", "manager", "member", "viewer"], {
    required_error: "Choose a role."
  }),
  redirectUrl: z.string().url("Provide a valid invite URL.")
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
    return { status: "success", message: "Transaction recorded." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save transaction."
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
    redirect(`/dashboard?wallet=${parsed.data.walletId}`);
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
    return { status: "success", message: "Team linked to wallet." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to link team."
    };
  }
}

export async function inviteTeamMemberAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = inviteMemberSchema.safeParse({
    walletId: formData.get("walletId"),
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    redirectUrl: formData.get("redirectUrl")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and retry.",
      fieldErrors: mapZodErrors(parsed.error)
    };
  }

  try {
    await inviteTeamMemberToWallet({
      walletId: parsed.data.walletId,
      email: parsed.data.email,
      name: parsed.data.name || null,
      role: parsed.data.role,
      redirectUrl: parsed.data.redirectUrl
    });
    revalidatePath("/dashboard");
    return { status: "success", message: "Invite sent." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to send invite."
    };
  }
}
