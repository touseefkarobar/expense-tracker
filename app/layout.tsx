import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { cn } from "@/lib/utils/cn";
import { fontSans } from "@/lib/utils/fonts";
import { ReactQueryProvider } from "@/lib/providers/react-query-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

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
          "min-h-screen bg-slate-100 text-slate-900 antialiased",
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen w-full justify-center bg-slate-200/40">
              <main className="flex w-full max-w-[420px] flex-1 flex-col">
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
