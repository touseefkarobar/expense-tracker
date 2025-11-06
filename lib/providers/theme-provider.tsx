"use client";

import type { ReactNode } from "react";

type ThemeProviderProps = {
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
