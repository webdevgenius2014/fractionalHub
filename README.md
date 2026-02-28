# FractionalHub

A B2B marketplace connecting Fractional C-Suite Executives (CTOs, CMOs, PMs, CFOs, COOs) with companies needing strategic leadership on flexible terms.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Payments:** Stripe + Stripe Connect
- **Hosting:** Vercel (Frontend) + Supabase (Backend)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo>
cd fractional-hub
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Enable Realtime for `messages`, `notifications`, and `transactions` tables
4. Go to **Settings → API** and copy your Project URL and anon key

### 3. Set Up Stripe

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from **Developers → API Keys**
3. Enable **Stripe Connect** for executive payouts
4. Deploy the `supabase/functions/stripe-webhook/` Edge Function
5. Configure the webhook endpoint in Stripe Dashboard

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)            # Homepage, Jobs, Candidates, Pricing, About
│   ├── auth/               # Login, Signup, Forgot Password
│   ├── dashboard/          # Candidate & Company dashboards
│   └── admin/              # Admin panel
├── components/
│   ├── auth/               # AuthProvider
│   ├── candidates/         # Candidate cards
│   ├── jobs/               # Job cards
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── payment/            # Payment breakdown display
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── stripe/             # Stripe client
│   └── utils.ts            # Utility functions
├── types/
│   └── database.ts         # TypeScript types matching DB schema
└── middleware.ts            # Auth protection middleware
supabase/
├── schema.sql              # Complete database schema + RLS policies
└── functions/
    └── stripe-webhook/     # Stripe webhook Edge Function
```

## Commission Model

- **Companies pay:** Agreed rate + 5% platform fee
- **Executives receive:** Agreed rate - 5% platform fee
- **Platform earns:** 10% of agreed rate (5% + 5%)

Example for a $5,000 engagement:
- Company pays: **$5,250**
- Executive receives: **$4,750**
- Platform earns: **$500**

Admins can adjust commission rates via `/admin/commission`.

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Supabase Edge Functions
```bash
supabase functions deploy stripe-webhook
```

Set environment variables in Supabase Dashboard → Edge Functions:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Features

- **Authentication:** Email/password via Supabase Auth
- **Role-based access:** Candidate, Company, Admin
- **Real-time messaging:** Supabase Realtime WebSockets
- **Job posting & applications:** Full CRUD for companies
- **Payment flow:** Stripe charge on candidate acceptance
- **Payouts:** Stripe Connect for executive payouts
- **Reviews:** Post-engagement review system
- **Admin panel:** Commission management, user management, analytics
- **RLS:** Row-level security for data isolation
