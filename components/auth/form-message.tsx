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
        "rounded-md border px-3 py-2 text-sm",
        variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {message}
    </p>
  );
}
