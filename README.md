# culture-index

Culture Index survey pipeline: Supabase ↔ Vercel ↔ Resend. Admin creates survey links; candidates complete surveys; results are PIN-protected and exportable.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use `.env.local` for all env vars (see below).

## Deploying on Vercel (fix for "supabaseKey is required")

The error **"supabaseKey is required"** when a candidate opens the survey link happens when the Supabase client runs in the browser (with env vars missing at build time). **Fix:** `lib/supabase.js` was removed so the client bundle never loads Supabase; all DB access goes through API routes only. After pulling this fix, redeploy on Vercel so the new build is used.

1. **Vercel → Project → Settings → Environment Variables**
   - Add every variable from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL` (optional; Resend default used if unset)
     - `NEXT_PUBLIC_ADMIN_PIN` (optional; default `1234`)
     - `NEXT_PUBLIC_BASE_URL` = your Vercel app URL (e.g. `https://your-app.vercel.app`)
   - Apply to **Production** (and **Preview** if you use preview deploys).

2. **Redeploy**
   - Deployments → latest deployment → ⋮ → **Redeploy** (so the build runs again with these env vars inlined where needed).

If the pipeline was working before and then broke, ensure no page or component imports `lib/supabase` or uses Supabase in the browser; all DB access should go through `/api/get-survey`, `/api/get-results`, `/api/create-survey`, `/api/submit-survey`, `/api/save-notes`.