# TripBook (Voyagr) — Portfolio Travel Booking App

TripBook is a beautiful full-stack hotel and flight search and booking platform built with **Next.js 14 (App Router)**, **Supabase SSR Auth**, **TypeScript**, and **Tailwind CSS**. It connects to the **LiteAPI (Nuitee Connect)** sandbox travel provider to search and simulate bookings securely.

## 🚀 Key Architectural Details

1. **Server-Only API Wrapper**: Direct calls to LiteAPI are restricted. Every client action (autosuggest, rate search, booking validation, cancellation) goes through Next.js server route handlers (`src/app/api/**/route.ts`) which protect environment API keys.
2. **Supabase Row-Level Security (RLS)**: Row Level Security is configured on every Postgres database table:
   - `profiles`: Users may read/write only their own profiles.
   - `bookings`: Users may read/write only their own booking rows (`user_id = auth.uid()`).
   - `cities`/`airports`: Public-read only, no public-write.
3. **Idempotent Reservations**: The booking workflow accepts and verifies a unique `idempotency_key` generated when the booking screen mounts. This prevents double-submits from creating duplicate reservations.
4. **IP-Based Rate Limiting**: Features server-side sliding-window rate limit checks for search and autocomplete endpoints.
5. **No Client Trust for Prices**: Price calculations and availability sessions are verified and requested directly from the LiteAPI prebook confirmation endpoint before database writes.

---

## 🛠️ Getting Started & Setup

### 1. Environment Configuration

Create a `.env.local` file at the root of the project. Reference the template in `.env.example`:

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LiteAPI (Nuitee Connect Sandbox)
LITEAPI_KEY=your-sandbox-liteapi-key

# Local Redirection Host (Redirect callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Migration Setup

Copy the SQL content from `supabase/migrations/001_initial_schema.sql` and run it directly in your **Supabase Project → SQL Editor**. This initiates:
- `profiles`, `cities`, `airports`, and `bookings` tables.
- RLS constraints and indexing checks.
- Auth triggers to automatically initiate profile cards for new email-signups and Google logins.

### 3. Database Reference Seeding

Run the seed scripts to populate reference data for cities and airports (used for debounced auto-suggest fields):

```bash
# Seed cities database reference entries
npx ts-node scripts/seed-cities.ts

# Seed airport hub database reference entries
npx ts-node scripts/seed-airports.ts
```

### 4. Install & Run Dev Server

```bash
# Install npm dependencies
npm install

# Start local server
npm run dev
```

Open `http://localhost:3000` to test out the application.

---

## 🔐 Authentication Requirements

- **Email & Password**: Account registration and login.
- **Google OAuth**: Click "Continue with Google" to login. Ensure callback URL is added to Supabase Auth Providers: `${NEXT_PUBLIC_APP_URL}/auth/callback`.
- **Email Verification**: Users must verify their email before booking hotels or flights. If a user attempts to book while unverified, a warning screen disables the submission.
- **Provider Conflicts**: Detects existing password/Google credential conflicts on registration and alerts the user instead of silently linking or overriding existing accounts.

---

## 📦 Production Transition Checklist

To scale this portfolio project into a live commercial deployment, the following changes are required:

1. **Payment Gateway**: Integrate **Stripe** or a similar payment gateway:
   - In `src/app/api/hotels/book/route.ts` and `src/app/api/flights/book/route.ts`, insert a Stripe Payment Intent checks and card verification step before executing the LiteAPI booking call.
2. **LiteAPI Production Credentials**: Replace the sandbox key in `LITEAPI_KEY` with a production API key and update the API base URL in `src/lib/liteapi/client.ts` from `https://api.liteapi.travel/v3.0` to the production gateway.
3. **Database Scalability**: Replace the basic in-memory rate limiter in `src/lib/rate-limit.ts` with a **Redis-backed client** (e.g., Upstash Redis) to persist IP limit tracking across stateless serverless functions (like Vercel serverless functions).
4. **Email Gateway SMTP**: Enable a custom SMTP provider (e.g. Resend, SendGrid) inside your Supabase Auth dashboard to send email verification confirmations to real users.
