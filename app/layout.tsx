import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { cn } from "@/lib/utils/cn";
import { fontSans } from "@/lib/utils/fonts";
import { ReactQueryProvider } from "@/lib/providers/react-query-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AppHeader from "@/components/layout/app-header";
import AppFooter from "@/components/layout/app-footer";

export const metadata: Metadata = {
  title: "Shared Wallet Expense Tracker",
  description: "Collaborative expense tracking powered by Next.js and Appwrite"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-white text-slate-900 antialiased",
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <AppFooter />
            </div>
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
