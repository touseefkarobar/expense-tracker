"use client";

import { ReactNode } from "react";

export function ThemeProvider({ children }: { attribute?: string; defaultTheme?: string; enableSystem?: boolean; children: ReactNode; }) {
  return <>{children}</>;
}
