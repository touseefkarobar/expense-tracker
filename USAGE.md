# Usage Guide – Shared Wallet Expense Tracker

This guide walks you through configuring Appwrite, signing in, and using the in-app finance tools that ship with this
starter.

## 1. Prerequisites

- An Appwrite project (Cloud or self-hosted) with an API key that has access to Database, Teams, and Account APIs.
- Environment variables copied from `.env.example` into `.env.local`.
- Node.js 18+ and npm 9+ installed locally.

## 2. Appwrite Setup

1. **Create required collections**  
   From the project root run:
   ```bash
   npm run setup:appwrite
   ```
   The script provisions the database (`expense_tracker`) and all collections defined in `lib/server/database-schema.ts`.

2. **Create an API key** with access to:
   - Databases (read/write)
   - Teams (read/write)
   - Account (session management)

3. **Populate `.env.local`**  
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=api-key-with-server-perms
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   ```

4. Restart the development server after updating env vars:
   ```bash
   npm run dev
   ```

## 3. Signing In

1. Visit [http://localhost:3000/login](http://localhost:3000/login).
2. Register a new account or log in with an existing Appwrite email/password user.
3. Successful authentication stores an `appwrite-session` cookie (see `lib/server/auth-actions.ts`).

## 4. Creating a Workspace

1. Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
2. Use **“Create your first wallet”** to define a wallet name, currency, and optional monthly budget.  
   - Wallets are stored in the `wallets` collection.
   - You can associate an Appwrite Team later by filling in the optional Team ID.

> Tip: Multiple wallets are supported. Use the selector in the top-right corner of the dashboard to switch between them.

## 5. Managing Categories

1. With a wallet selected, open the **Categories** card.
2. Add income or expense categories using the inline form.
3. Existing categories appear in a badge list for quick scanning.
4. Categories are stored in the `categories` collection and scoped by `wallet_id`.

## 6. Recording Transactions

1. In the **Record a transaction** card:
   - Choose type (income/expense).
   - Select a category (optional).
   - Enter amount, date/time, merchant, and memo.
2. Submit to persist the transaction (`transactions` collection). The form clears and the stats refresh automatically.
3. Recent transactions are listed below with a delete action. Deletion revokes the document in Appwrite and revalidates the UI.

## 7. Reading Dashboard Insights

- **Stats cards** show total income, total expenses, and net position for the selected wallet.
- **Category summary** ranks expense and income categories by cumulative amount to highlight outliers.
- **Recent transactions** provide an audit trail with memo/context to keep the team aligned.

## 8. Next Steps

- Invite teammates by creating an Appwrite Team and storing its ID on each wallet.
- Implement role-based permissions (Owners/Managers/Members/Viewers) using Appwrite document permissions.
- Extend analytics with scheduled Appwrite Functions (recurring transactions, alerts, CSV import).

Need more help? Check the README for architecture details or open an issue with reproduction steps.
