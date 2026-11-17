# Certificate Registry — Independent Prototype

React/Vite + Supabase certificate search and password-protected administrator CRUD. Uses user-supplied visual references for a prototype only. **Not an official UASL/IAAB site** and no accreditation is claimed. Obtain permission before publishing third-party trademarks or presenting any certificate as issuer-verified.

## Setup
1. Create a **new** Supabase project (separate from QC).
2. Paste `schema.sql` into Supabase SQL Editor and run it.
3. Supabase → Authentication → Users → Add user. Copy that user's UUID.
4. Run `insert into public.admin_users(user_id) values ('YOUR_UUID');` in SQL Editor.
5. Copy `.env.example` to `.env` and fill in Supabase Project URL and **publishable/anon key** (NEVER the service_role key).
6. Run `npm install` then `npm run dev`. Public page: `/`; admin page: `/admin`.
7. For deployment, push repository to GitHub, import it into Vercel, and add the same `VITE_...` environment variables to Vercel. Build command `npm run build`, output `dist`. Set Vercel SPA rewrite to serve `index.html` for `/admin`.

## Data
The example certificate record in SQL is transcribed from the provided image and explicitly marked `unverified`. The screenshot of a search result contains a different number (`FMS/D651/1126`); the image of the certificate shows `HACCP/D651/1126`, which is used here. Only issuer-confirmed certificates should be marked `active`.

## Security
RLS limits insert/update/delete to UUIDs listed in `admin_users`. Supabase Authentication handles passwords. Public read is enabled for registry lookups. For production, add rate limiting, CAPTCHA, audit logs, and formal approval for published records.
