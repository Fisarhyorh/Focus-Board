# Focus Board

A task management dashboard with a drag-and-drop Kanban board, built to demonstrate full-stack skills with authentication, a real database, and live data visualization — not just static UI.

**Live demo:** _add your Vercel link here once deployed_

## Features

- **Authentication** — email/password sign up and login, powered by Supabase Auth
- **Kanban board** — tasks organized into To Do, In Progress, and Done columns
- **Drag and drop** — move tasks between columns by dragging, or use the quick-action button on each card (Start / Mark done / Reopen)
- **Edit in place** — click any task to update its title or description
- **Row-level security** — each user can only see and modify their own tasks, enforced at the database level via Supabase RLS policies, not just in the UI
- **Completion chart** — a 7-day line chart showing how many tasks were completed each day
- **Optimistic UI updates** — actions (create, delete, edit, drag) update the interface instantly and roll back automatically if the database call fails

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (Postgres + Row Level Security)
- **Drag and drop:** @hello-pangea/dnd
- **Charts:** Recharts

## Why these choices

Supabase was chosen over a custom backend to demonstrate working with a managed Postgres database and auth provider — the kind of stack many small-to-mid-size client projects use for speed and cost reasons. Row Level Security is enforced at the database layer rather than only checked in application code, so the security model holds even if a request bypasses the UI entirely.

## Running it locally

1. Clone the repo:
   ```
   git clone https://github.com/YOUR-USERNAME/focus-board.git
   cd focus-board
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Supabase project at [supabase.com](https://supabase.com), then run the SQL in `schema.sql` (found in this repo) via the Supabase SQL Editor to create the `tasks` table and its security policies.

4. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```
   Both values are in your Supabase dashboard under **Project Settings → API Keys**.

5. Run the dev server:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Project structure

```
app/
  login/page.tsx      — sign up / log in
  tasks/page.tsx       — main Kanban board
components/
  EditTaskModal.tsx    — edit task modal
  TaskChart.tsx         — completion chart
lib/
  supabase.ts           — Supabase client setup
  useAuth.ts            — auth state hook
schema.sql               — database schema + RLS policies
```