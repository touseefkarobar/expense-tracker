import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ShellProps {
  children: ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[420px] px-4", className)}>
      {children}
    </div>
  );
}
