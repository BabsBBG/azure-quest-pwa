# AUTH_SETUP.md

PraxisGrid uses Supabase Auth for individual email/password accounts, Google SSO, and M3+ learner data sync.

## Environment variables

Create `.env.local` with:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

Only use the public Supabase anon or publishable key in the frontend. Do not commit service-role keys, Supabase secret keys, access tokens, or database passwords.

Google OAuth client IDs and client secrets are configured in the Supabase Auth provider dashboard only. Do not add Google OAuth secrets to Vite environment variables, `.env.example`, source code, or documentation examples.

## Current scope

- Email/password sign up.
- Email/password sign in.
- Google SSO through Supabase OAuth.
- Sign out.
- Auth state persists through Supabase client session storage.
- Account/Profile page.
- Logged-out local practice remains available.
- Profile upsert to `profiles`.
- Best-effort cloud sync for quiz attempts, interview sessions, question flags, and imported projects.
- LocalForage remains the first write path so learners do not lose progress if Supabase is unavailable.

## Google SSO setup

Enable the Google provider in Supabase Auth. In Google Cloud, add the Supabase callback URL for the project, usually:

```text
https://your-project-ref.supabase.co/auth/v1/callback
```

In Supabase Auth URL settings, allow-list the app redirect URLs for each environment that needs sign-in:

- Local Vite: `http://localhost:5173/account` or the active local dev port.
- Production: `https://azure-quest-pwa.vercel.app/account` until the production domain is rebranded.
- Future PraxisGrid alias: `https://praxisgrid.vercel.app/account` after the alias is assigned to the connected Vercel project.

Supabase handles the OAuth exchange and returns the browser to `/account`. The frontend uses `detectSessionInUrl` and never handles Google client secrets directly.

## Database migrations

Production status on 2026-07-29:

- Supabase organisation: `BabsBBG's Org`.
- Production project: `praxisgrid-production`.
- Region: `eu-west-1`.
- Project ref: `ozf...agfd`.
- Migrations `0001` through `0025` are applied and local/remote migration history matches.
- Vercel Production has encrypted `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.
- Google OAuth remains disabled/unverified until real Google OAuth provider credentials are supplied.
- Real owner bootstrap is live-verified for `tobibabalola21@gmail.com` as `MAIN_ADMIN`. Owner self-service password reset email has been sent; owner completion of the reset link remains pending.

## Not included

- GitHub OAuth.
- GitHub write scopes.
- Private repository import.
- Client-side LLM calls.
- Live LLM question generation during quiz/exam attempts.
