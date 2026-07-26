# Auth And RLS

PraxisGrid uses Supabase Auth for email/password accounts and Google SSO. The browser only receives the public Supabase anon key; provider secrets, service-role keys, and database passwords must stay outside frontend code.

Google SSO is brokered through Supabase OAuth. Google client IDs and client secrets belong in the Supabase provider configuration and Google Cloud OAuth settings, not in `.env.example`, Vite env vars, or committed docs.

Users must only access their own profiles, attempts, interview sessions, imported projects, and question flags. Current migrations define owner-only RLS for learner data and role-gated access for review/admin tables; live Supabase RLS application remains a deployment verification item.
