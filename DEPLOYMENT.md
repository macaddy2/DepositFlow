# DepositFlow — Railway Deployment Guide

## Prerequisites
- GitHub repo: `macaddy2/DepositFlow` (already pushed)
- [Railway](https://railway.app) account
- Supabase project with schema applied
- [Resend](https://resend.com) account + API key (for emails)

---

## 1. Apply Database Migrations

Run in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
-- Paste and run: supabase/migrations/20240523000000_add_insert_policies.sql
-- Paste and run: supabase/migrations/20260219000000_add_signed_fields_to_offers.sql
```

---

## 2. Create a Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Deploy from GitHub repo**
3. Select `macaddy2/DepositFlow`
4. Railway will auto-detect Next.js — confirm and deploy

---

## 3. Set Environment Variables

Railway dashboard → your service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `RESEND_API_KEY` | Your Resend API key |
| `NEXT_PUBLIC_SITE_URL` | Your Railway public URL (e.g. `https://depositflow.up.railway.app`) |
| `ADMIN_EMAIL` | Your admin email for `/admin` access |

> Railway auto-sets `PORT` — Next.js reads this automatically, no extra config needed.

---

## 4. Set Start Command

Railway → Service Settings → **Start Command**:
```
npm run start
```
And **Build Command**:
```
npm run build
```

---

## 5. Set Supabase Auth Redirect URLs

Supabase → Authentication → URL Configuration:
- **Site URL:** `https://your-app.up.railway.app`
- **Redirect URLs:** add `https://your-app.up.railway.app/auth/callback`

---

## 6. Trigger Redeploy

After setting env vars, Railway → Deployments → **Redeploy** (or push a commit).

---

## 7. Verify

- [ ] Landing page loads at your Railway URL
- [ ] Magic link login works (check Supabase auth redirect is set)
- [ ] Complete onboarding → offer email received
- [ ] Accept offer → sign deed → deed-signed email received
- [ ] `/admin` accessible with your admin email
