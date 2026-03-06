# TripMind - Final Handoff Document

## Project Overview
TripMind is an AI-powered travel itinerary planner that instantly generates day-by-day itineraries with smart packing lists and budget tracking. The project uses a **zero-server architecture** running React + Vite on the frontend with Supabase (Postgres + Auth) as the backend and Google Gemini 2.5 Flash for AI generation.

## Architecture

```
Frontend (React/Vite/Tailwind)
  ├── Supabase Auth (Google OAuth)
  ├── Supabase Postgres (trips, days, activities, packing_items)
  ├── Supabase RPC (save_trip_atomic - atomic multi-table inserts)
  └── Google Gemini 2.5 Flash API (itinerary generation)
```

- **Frontend**: React 18, Vite 7, Tailwind CSS 3, Wouter, Radix UI (shadcn/ui)
- **Backend**: Supabase (Postgres + Auth + Edge Functions)
- **AI**: Google Gemini 2.5 Flash (JSON mode, temperature 0.4)
- **Deployment**: Static build → Vercel / Netlify / GitHub Pages

## Project Structure

```
TripMind/
├── client/
│   ├── index.html
│   ├── public/              # Static assets (logos, favicon, _redirects)
│   └── src/
│       ├── App.tsx           # Router + ErrorBoundary
│       ├── main.tsx          # React entry
│       ├── index.css         # Tailwind + custom styles
│       ├── components/       # TopNav, BottomNav, TripCard, ActivityCard, ui/
│       ├── pages/            # Landing, Dashboard, NewTrip, TripView
│       ├── hooks/            # use-auth, use-trips, use-toast, use-mobile
│       └── lib/              # supabase client, queryClient, utils
├── shared/
│   └── schema.ts             # TypeScript types (aligned with Supabase schema)
├── script/
│   └── push_schema.ts        # SQL schema + RPC function (run once)
├── supabase/
│   ├── migrations/
│   │   └── 001_enable_rls.sql  # Row Level Security policies
│   └── functions/
│       └── generate-trip/      # Edge Function for Gemini API (optional)
│           └── index.ts
├── .env                       # Local secrets (gitignored)
├── .env.example               # Template for env vars
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                # Vercel SPA config
└── HANDOFF.md
```

## Completed Work (Closure Audit)

### Security Fixes
- [x] `.env` added to `.gitignore` - credentials no longer at risk of being committed
- [x] `.env.example` created with placeholder values
- [x] Row Level Security (RLS) policies written for all tables (`supabase/migrations/001_enable_rls.sql`)
- [x] `save_trip_atomic` RPC now validates `auth.uid() = p_user_id` before executing
- [x] Supabase Edge Function scaffolded to move Gemini API key off the client

### Schema Fixes
- [x] `cover_emoji` column added to trips table and RPC function
- [x] Drizzle types aligned with actual Supabase schema (UUID trip IDs, snake_case columns)
- [x] `summary` field added to days table

### Code Fixes
- [x] User metadata display fixed (`user.user_metadata.full_name` instead of `user.firstName`)
- [x] All snake_case field name mismatches fixed across all UI components
- [x] Trip ID handling changed from integer to UUID string throughout
- [x] Gemini JSON parsing wrapped in try/catch with user-friendly error
- [x] React Error Boundary added to prevent white-screen crashes

### Dead Code Removal
- [x] Entire `server/` directory removed (Express, Passport, Drizzle ORM - all legacy Replit code)
- [x] `.replit` configuration file removed
- [x] `drizzle.config.ts` removed
- [x] Replit Vite plugins removed from `vite.config.ts`
- [x] 27 dead dependencies removed from `package.json`
- [x] Package renamed from `rest-express` to `tripmind`
- [x] Build scripts updated to use Vite directly

### Deployment
- [x] `vercel.json` created with SPA rewrite rules
- [x] `_redirects` file created for Netlify fallback
- [x] Build output: `dist/public/`

## Environment Variables

```bash
# Required for frontend (embedded in build)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_GEMINI_API_KEY="your-gemini-api-key"  # Remove after Edge Function migration

# Required for push_schema.ts only
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

## Getting Started (Local Dev)

```bash
cd TripMind
cp .env.example .env   # Fill in your actual keys
npm install
npm run dev             # Opens at http://localhost:5173
```

## Database Setup (First Time)

1. Create a Supabase project
2. Enable Google OAuth in Supabase Auth settings
3. Set `DATABASE_URL` in `.env` with your Supabase Postgres connection string
4. Run `npm run db:push` to create tables and the RPC function
5. Run the RLS migration in Supabase SQL Editor: copy/paste `supabase/migrations/001_enable_rls.sql`

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`
4. Build command: `npm run build`
5. Output directory: `dist/public`
6. Add your Vercel domain to Supabase Auth → Redirect URLs

## Remaining Steps for Full Production

### Must Do Before Public Launch
- [ ] **Rotate all credentials** - the old keys were in plaintext `.env` (may have been committed previously)
- [ ] **Run RLS migration** - execute `001_enable_rls.sql` in Supabase SQL Editor
- [ ] **Run updated schema** - execute `npm run db:push` to add `cover_emoji` column and update RPC
- [ ] **Deploy Gemini Edge Function** - move API key off client-side:
  ```bash
  supabase functions deploy generate-trip
  supabase secrets set GEMINI_API_KEY=your-key
  ```
  Then update `use-trips.ts` to call `supabase.functions.invoke('generate-trip', {...})` instead of the client-side `@google/genai`

### Nice to Have
- [ ] Add rate limiting for trip generation (cooldown per user)
- [ ] Add trip delete confirmation dialog
- [ ] Add AI-generated packing list suggestions
- [ ] Add dark mode toggle
- [ ] Add trip sharing via read-only link
- [ ] Add export to PDF

## Known Decisions
- **OAuth redirect**: Fixed trailing slash mismatch. Code uses `window.location.origin` (no trailing slash). Ensure Supabase redirect URLs match exactly.
- **Currency**: Hardcoded to INR (₹). Budget and costs are in Indian Rupees.
- **Trip IDs**: UUIDs generated by Postgres `uuid_generate_v4()`.
- **Gemini model**: `gemini-2.5-flash` with JSON response mode and temperature 0.4.
