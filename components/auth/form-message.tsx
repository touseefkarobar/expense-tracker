"use client";

import { cn } from "@/lib/utils/cn";

interface FormMessageProps {
  message?: string | null;
  variant?: "success" | "error";
}

export function FormMessage({ message, variant = "error" }: FormMessageProps) {
  if (!message) return null;
  return (
    <p
      className={cn(
        "rounded-xl border px-3 py-2 text-xs font-medium",
        variant === "success"
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/40 bg-rose-400/10 text-rose-100"
      )}
    >
      {message}
    </p>
  );
}
