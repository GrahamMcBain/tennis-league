# Tennis League

Competitive2 Division — Summer 2026 standings and match tracking app built with SvelteKit, Tailwind CSS, and Supabase.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Once your project is ready, go to **SQL Editor** and run the contents of `supabase/schema.sql` to create the `matches` table.

### 2. Add environment variables

Copy `.env.example` to `.env.local` and fill in your project credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase dashboard under **Project Settings → API**.

### 3. Install dependencies and run locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the two environment variables (`PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings under **Environment Variables**.
4. Deploy — Vercel will detect SvelteKit automatically.

## Deploy to Netlify

1. Push this repo to GitHub.
2. Import the project in [Netlify](https://netlify.com).
3. Set the build command to `npm run build` and publish directory to `build`.
4. Add the environment variables in **Site settings → Environment variables**.
5. Deploy.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Standings — sortable table with playoff eligibility |
| `/submit` | Submit a match result |
| `/players/[id]` | Player profile with win/loss record and head-to-head stats |

## Playoff Eligibility

A player is playoff eligible when they have:
- **3 or more wins**, AND
- **6 or more unique opponents**
