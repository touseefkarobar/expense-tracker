# Project Description — Shared Wallet Expense Tracker (Next.js + Appwrite)

## 1) Summary

A modern, multi-user expense tracker where multiple people can log in to a **shared wallet**, record **expenses & incomes**, organize **categories**, set **monthly budgets**, and view **stats/insights**. Built with **Next.js (App Router)** for the frontend and **Appwrite** for auth, database, storage, and serverless functions. UI is clean, responsive, and keyboard-friendly.

## 2) Goals & Success Criteria

- **Multi-user shared wallets:** Invite collaborators; everyone can add/edit transactions per role.
- **Fast CRUD:** Add/edit/delete expenses & incomes in < 3 clicks.
- **Clear overview:** Monthly budget vs. actual, category breakdown, trend charts.
- **Mobile-first UX:** Works great on phones, tablets, desktops.
- **Data integrity & security:** Row-level access controls; audit of edits.

**KPIs**

- Time to first transaction < 60s after signup.
- P50 transaction create latency < 300 ms.
- Dashboard loads < 1 s (p75) on 4G.

## 3) Core Features

- **Auth & Accounts**
  - Email/password (Appwrite Auth), optional OAuth providers.
  - Profile basics (name, avatar).
- **Wallets (shared)**
  - Create/join multiple wallets.
  - Invite via email link; roles: **Owner**, **Manager**, **Member**, **Viewer**.
- **Transactions**
  - CRUD for **expenses** and **incomes**.
  - Fields: amount, type, date, category, notes, merchant/payee, attachments, tags.
  - **Recurring** rules (monthly/weekly/custom) via Appwrite Functions cron.
  - **Attachments** (receipts) via Appwrite Storage; virus scan hook (optional).
- **Categories**
  - Custom income & expense categories; colors & icons.
  - Archive/merge categories.
- **Budgets**
  - Monthly wallet budget + per-category budgets.
  - Rollover (on/off), alerts when thresholds hit (e.g., 80 %, 100 %).
- **Insights & Stats**
  - Current month burn-down, category pie, income vs. expense trend, top merchants.
  - Filters by date range, category, member, tag.
  - Export CSV for a range.
- **Collaboration & Safety**
  - Role-based permissions; activity log (who did what, when).
  - Soft-delete with 30-day restore.
- **Quality of Life**
  - Quick-add from navbar; keyboard shortcuts.
  - Bulk edit & import CSV.
  - Dark mode, accessible components.

## 4) Tech Stack

- **Frontend:** Next.js (App Router, Server Components), TypeScript, Tailwind CSS, lightweight UI primitives.
- **Backend:** Appwrite (Auth, Database, Storage, Functions, Teams).
- **Charts:** Recharts.
- **State/Data:** React Query (or RSC + fetch), Zod for validation.
- **Testing:** Playwright (E2E), Vitest/RTL (unit), Appwrite function tests.
- **CI/CD:** Vercel (frontend) + Appwrite Cloud/Self-hosted. GitHub Actions.

## 5) High-Level Architecture

- **Next.js** renders UI, calling the **Appwrite SDK** from server and client components.
- **Appwrite Database** collections hold wallets, memberships, transactions, categories, budgets.
- **Appwrite Functions**
  - Recurring transaction generator (scheduled).
  - Budget threshold notifier (event-driven).
  - CSV import parser.
  - Analytics pre-aggregation (nightly).
- **Security** via Appwrite Teams & per-document permissions (owner/role based).

## 6) Data Model (Appwrite Collections)

| Collection | Purpose | Key Fields / Notes |
| ---------- | ------- | ------------------ |
| `wallets` | Logical grouping of transactions shared by a team. | Name, default currency, owner team id, monthly budget. |
| `members` | Membership metadata for a wallet. | Wallet document ID, Appwrite user ID, role enum (owner/manager/member/viewer). |
| `transactions` | Expense & income entries. | Wallet id, amount, type, category id, occurred_at, memo, merchant, tags, attachment file ids, recurring rule id. |
| `categories` | Custom income/expense classifications per wallet. | Wallet id, name, type, color, icon, archived_at. |
| `budgets` | Monthly and per-category budget definitions. | Wallet id, category id?, limit, rollover flag, alerts array. |
| `recurring_rules` | Describes schedules for automated transactions. | Wallet id, cadence, next_run_at, payload. |
| `activity_logs` | Append-only history of actions. | Wallet id, actor id, action type, metadata JSON, created_at. |

Built-in Appwrite resources used:

- **Users** for authentication.
- **Teams** to mirror shared wallets and manage invitations.
- **Memberships** to represent each user’s role in a wallet.

## 7) Appwrite Configuration Checklist

1. Create a Project and note the endpoint + project ID.
2. Configure Auth providers (email/password required, OAuth optional).
3. Create a Team per wallet when a new wallet document is added.
4. Provision Database collections above with role-based permissions (owners/managers write, members comment, viewers read).
5. Enable Storage bucket for receipt uploads and set file rules to wallet team.
6. Deploy Functions for recurring transactions, budget notifications, CSV import, and analytics materialization.

Environment variables required by this starter live in [`.env.example`](./.env.example).

## 8) Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```
   > If npm registry access is restricted, install packages where you have connectivity, then copy the `node_modules` folder or the generated lockfile back into this workspace.
2. Copy `.env.example` to `.env.local` and fill in your Appwrite credentials.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000) for the marketing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the demo dashboard.

## 9) Project Structure Highlights

```
app/
  (auth)/           Auth routes wired to Appwrite server actions.
  (dashboard)/      Demo dashboard with charts and budget widgets.
  wallets/          Placeholder view for team management.
  reports/          Placeholder view for analytics & exports.
components/
  dashboard/        UI building blocks for insights, budgets, activity.
  layout/           Shared layout primitives.
  ui/               Tailwind-based design system pieces.
lib/
  appwrite-client.ts  Browser-side Appwrite SDK factory.
  server/             Server-only Appwrite client & auth actions.
```

## 10) Next Steps

- Replace dashboard mocks with live queries from Appwrite Databases (server components or React Query).
- Implement wallet invitations and role management via Appwrite Teams APIs.
- Add transaction CRUD forms with validation (React Hook Form + Zod recommended).
- Expand test coverage with Vitest/RTL for components and Playwright for end-to-end flows.
- Wire up Appwrite Functions for recurring entries, budget alerts, and CSV import.

Happy building!
