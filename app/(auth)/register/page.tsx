import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/lib/server/auth-actions";
import { Shell } from "@/components/layout/shell";
import RegisterForm from "@/components/auth/register-form";

interface FormState {
  message: string | null;
  success: boolean;
}

export const metadata = {
  title: "Create account | Shared Wallet Expense Tracker"
};

async function register(_: FormState, formData: FormData): Promise<FormState> {
  "use server";

  const result = await registerUser(formData);
  if (result?.success) {
    redirect("/dashboard");
  }
  return {
    message: result?.error ?? null,
    success: Boolean(result?.success)
  };
}

export default function RegisterPage() {
  return (
    <Shell className="flex max-w-md flex-col gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Create your workspace</h1>
        <p className="text-sm text-slate-600">
          Sign up to invite teammates, manage shared wallets, and track budgets together.
        </p>
      </div>
      <RegisterForm action={register} />
      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-brand hover:underline">Sign in</Link>.
      </p>
    </Shell>
  );
}
