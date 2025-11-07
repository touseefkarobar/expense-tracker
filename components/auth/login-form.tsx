"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/auth/form-message";

interface FormState {
  message: string | null;
  success: boolean;
}

const initialState: FormState = { message: null, success: false };

export default function LoginForm({ action }: { action: (state: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 px-5 py-6 shadow-inner backdrop-blur">
        <p className="text-xs text-slate-400">
          Use your email and password to continue. Sessions stay active on this device until you choose to log out.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-11 rounded-xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-400 focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 rounded-xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-400 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>
      <SubmitButton pendingText="Signing in...">Sign in</SubmitButton>
      <FormMessage message={state.message} variant={state.success ? "success" : "error"} />
    </form>
  );
}

function SubmitButton({ children, pendingText }: { children: ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-xl bg-teal-400 text-sm font-semibold text-slate-900 transition hover:bg-teal-300"
      disabled={pending}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
