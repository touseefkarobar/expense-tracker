"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormMessage } from "@/components/auth/form-message";

interface FormState {
  message: string | null;
  success: boolean;
}

const initialState: FormState = { message: null, success: false };

export default function RegisterForm({ action }: { action: (state: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Card>
        <CardHeader>
          <p className="text-sm text-slate-600">
            We use Appwrite Auth behind the scenes. Email verification can be toggled in the Appwrite console.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Ada Lovelace" required autoComplete="name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </div>
          <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
          <FormMessage message={state.message} variant={state.success ? "success" : "error"} />
        </CardContent>
      </Card>
    </form>
  );
}

function SubmitButton({ children, pendingText }: { children: ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}
