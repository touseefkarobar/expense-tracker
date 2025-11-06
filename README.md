Project Description — Shared Wallet Expense Tracker (Next.js + Appwrite)
========================================================================

1) Summary
----------

A modern, multi-user expense tracker where multiple people can log in to a **shared wallet**, record **expenses & incomes**, organize **categories**, set **monthly budgets**, and view **stats/insights**. Built with **Next.js (App Router)** for the frontend and **Appwrite** for auth, database, storage, and serverless functions. UI is clean, responsive, and keyboard-friendly.

2) Goals & Success Criteria
---------------------------

*   **Multi-user shared wallets:** Invite collaborators; everyone can add/edit transactions per role.
    
*   **Fast CRUD:** Add/edit/delete expenses & incomes in < 3 clicks.
    
*   **Clear overview:** Monthly budget vs. actual, category breakdown, trend charts.
    
*   **Mobile-first UX:** Works great on phones, tablets, desktops.
    
*   **Data integrity & security:** Row-level access controls; audit of edits.
    

**KPIs**

*   Time to first transaction < 60s after signup.
    
*   P50 transaction create latency < 300ms.
    
*   Dashboard loads < 1s (p75) on 4G.
    

3) Core Features
----------------

*   **Auth & Accounts**
    
    *   Email/password (Appwrite Auth), optional OAuth providers.
        
    *   Profile basics (name, avatar).
        
*   **Wallets (shared)**
    
    *   Create/join multiple wallets.
        
    *   Invite via email link; roles: **Owner**, **Manager**, **Member**, **Viewer**.
        
*   **Transactions**
    
    *   CRUD for **expenses** and **incomes**.
        
    *   Fields: amount, type, date, category, notes, merchant/payee, attachments, tags.
        
    *   **Recurring** rules (monthly/weekly/custom) via Appwrite Functions cron.
        
    *   **Attachments** (receipts) via Appwrite Storage; virus scan hook (optional).
        
*   **Categories**
    
    *   Custom income & expense categories; colors & icons.
        
    *   Archive/merge categories.
        
*   **Budgets**
    
    *   Monthly wallet budget + per-category budgets.
        
    *   Rollover (on/off), alerts when thresholds hit (e.g., 80%, 100%).
        
*   **Insights & Stats**
    
    *   Current month burn-down, category pie, income vs. expense trend, top merchants.
        
    *   Filters by date range, category, member, tag.
        
    *   Export CSV for a range.
        
*   **Collaboration & Safety**
    
    *   Role-based permissions; activity log (who did what, when).
        
    *   Soft-delete with 30-day restore.
        
*   **Quality of Life**
    
    *   Quick-add from navbar; keyboard shortcuts.
        
    *   Bulk edit & import CSV.
        
    *   Dark mode, accessible components.
        

4) Tech Stack
-------------

*   **Frontend:** Next.js (App Router, Server Components), TypeScript, Tailwind CSS, shadcn/ui.
    
*   **Backend:** Appwrite (Auth, Database, Storage, Functions, Teams).
    
*   **Charts:** Recharts.
    
*   **State/Data:** React Query (or RSC+fetch), Zod for validation.
    
*   **Testing:** Playwright (E2E), Vitest/RTL (unit), Appwrite function tests.
    
*   **CI/CD:** Vercel (frontend) + Appwrite Cloud/Self-hosted. GitHub Actions.
    

5) High-Level Architecture
--------------------------

*   **Next.js** renders UI, calls **Appwrite SDK** from server/client components.
    
*   **Appwrite Database** collections hold wallets, memberships, transactions, categories, budgets.
    
*   **Appwrite Functions**:
    
    *   recurring transaction generator (scheduled),
        
    *   budget threshold notifier (event-driven),
        
    *   CSV import parser,
        
    *   analytics pre-aggregation (nightly).
        
*   **Security** via Appwrite Teams & per-document permissions (owner/role based).
    

6) Data Model (Appwrite Collections)
------------------------------------

**users** (Appwrite built-in)**teams** (Appwrite Teams = wallets)**memberships** (built-in membership to teams)v