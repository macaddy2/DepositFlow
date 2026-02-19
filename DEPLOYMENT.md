# DepositFlow — Vercel Deployment Guide

## Prerequisites
- GitHub repo: `macaddy2/DepositFlow` (already pushed)
- Supabase project with schema applied
- [Resend](https://resend.com) account + API key (for email notifications)

---

## 1. Apply Database Migrations

Run these in order in the **Supabase SQL Editor** (or via the CLI):

```sql
-- Migration 1: RLS insert policies
-- File: supabase/migrations/20240523000000_add_insert_policies.sql

-- Migration 2: signed_at + signature_data on offers
-- File: supabase/migrations/20260219000000_add_signed_fields_to_offers.sql
```

Or via the CLI:
```bash
supabase db push
```

---

## 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** the `macaddy2/DepositFlow` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** — first deploy will fail (missing env vars, that's fine)

---

## 3. Set Environment Variables

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `RESEND_API_KEY` | Your Resend API key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel production URL (e.g. `https://depositflow.vercel.app`) |
| `ADMIN_EMAIL` | Your admin email address (for `/admin` access) |

---

## 4. Set Supabase Auth Redirect URLs

In Supabase → Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/auth/callback`

---

## 5. Redeploy

After setting env vars, trigger a redeploy:
- Vercel dashboard → Deployments → ⋯ → Redeploy
- Or push a new commit

---

## 6. Verify

- [ ] Visit `/` — landing page loads
- [ ] Visit `/login` — magic link login works
- [ ] Complete onboarding → check offer email is received
- [ ] Accept offer → sign deed → check deed-signed email
- [ ] Visit `/admin` with your admin email → see applications table
