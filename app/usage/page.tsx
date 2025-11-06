import type { Metadata } from "next";

import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Usage Guide | Shared Wallet Expense Tracker",
  description: "Step-by-step instructions for configuring Appwrite and using the shared wallet dashboard."
};

export default function UsageGuidePage() {
  return (
    <Shell className="space-y-10 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Usage guide</h1>
        <p className="text-sm text-slate-600">
          Configure Appwrite, sign in, and manage shared finances using the built-in dashboard tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">1. Prerequisites</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>Make sure you have:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>An Appwrite project (Cloud or self-hosted) with Database, Teams, and Account permissions.</li>
            <li>Environment variables copied from <code>.env.example</code> into <code>.env.local</code>.</li>
            <li>Node.js 18+ and npm 9+ installed locally.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">2. Appwrite setup</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Ensure the database schema exists:
              <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 font-mono text-xs text-slate-100">
                npm run setup:appwrite
              </pre>
            </li>
            <li>
              Create an Appwrite API key with access to Databases (read/write), Teams (read/write), and Account APIs.
            </li>
            <li>
              Populate <code>.env.local</code> with your Appwrite endpoint, project ID, API keys, and restart the dev server with{" "}
              <code>npm run dev</code>.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">3. Sign in & create a wallet</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open the app and sign up or log in via email/password (Appwrite Auth).</li>
            <li>
              Visit the dashboard and use the <strong>Create your first wallet</strong> form. Wallets group transactions by team,
              define the base currency, and optionally store a monthly budget or Appwrite Team ID.
            </li>
            <li>Use the wallet selector in the top right of the dashboard to switch between multiple wallets.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">4. Manage categories</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>Create income and expense categories from the dashboard. Categories feed the analytics widgets.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Categories are scoped per wallet and stored in the <code>categories</code> collection.</li>
            <li>Use colors or icons to align with your branding (optional fields).</li>
            <li>Categories appear in the list underneath the form so collaborators see the current taxonomy.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">5. Record transactions</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Use the transaction form to choose type (income/expense), category, amount, and date.</li>
            <li>Add context with merchant and memo fields – perfect for receipts or shared decision-making.</li>
            <li>
              Submitted transactions appear instantly in the stats cards, category summary, and recent transactions table. Delete
              mistakes with the inline action.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">6. Understand the analytics</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <ul className="list-disc space-y-1 pl-5">
            <li>Income vs. expenses vs. net position update for the selected wallet in real time.</li>
            <li>Category summary highlights top spend/income streams so you can act quickly.</li>
            <li>Recent transactions double as an audit log with category, memo, and amount context.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">7. Next steps</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <ul className="list-disc space-y-1 pl-5">
            <li>Associate wallets with Appwrite Teams to invite collaborators and enforce permissions.</li>
            <li>Automate recurring entries or alerts with Appwrite Functions.</li>
            <li>Extend analytics with historical ranges, CSV export, and scheduled reports.</li>
          </ul>
        </CardContent>
      </Card>
    </Shell>
  );
}
