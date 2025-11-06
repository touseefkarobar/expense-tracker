import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginUser } from "@/lib/server/auth-actions";
import { Shell } from "@/components/layout/shell";
import LoginForm from "@/components/auth/login-form";

interface FormState {
  message: string | null;
  success: boolean;
}

export const metadata: Metadata = {
  title: "Login | Shared Wallet Expense Tracker"
};

async function login(_: FormState, formData: FormData): Promise<FormState> {
  "use server";

  const result = await loginUser(formData);
  if (result?.success) {
    redirect("/dashboard");
  }
  return {
    message: result?.error ?? null,
    success: Boolean(result?.success)
  };
}

export default function LoginPage() {
  return (
    <Shell className="flex max-w-md flex-col gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-600">Sign in to access your shared wallets and budgets.</p>
      </div>
      <LoginForm action={login} />
      <p className="text-center text-sm text-slate-600">
        New here? <Link href="/register" className="text-brand hover:underline">Create an account</Link>.
      </p>
    </Shell>
  );
}
