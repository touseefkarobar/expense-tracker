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
    <Shell className="flex flex-1 flex-col justify-center">
      <div className="relative flex w-full flex-1 flex-col overflow-hidden rounded-[32px] bg-slate-950 text-slate-100 shadow-2xl ring-1 ring-slate-900/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_55%)]" />
        <div className="flex flex-col gap-3 px-8 pt-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Shared Wallet</span>
          <h1 className="text-3xl font-semibold leading-tight text-white">Sign in to track every expense</h1>
          <p className="text-sm text-slate-300">
            Keep budgets, transactions, and reports synced across every device with a single secure login.
          </p>
        </div>
        <div className="mt-8 flex-1 overflow-y-auto px-6 pb-12">
          <LoginForm action={login} />
          <p className="mt-6 text-center text-xs text-slate-400">
            New here?{" "}
            <Link href="/register" className="font-semibold text-teal-300 hover:text-teal-200">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}
