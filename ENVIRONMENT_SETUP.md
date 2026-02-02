# Environment Setup Guide

## Security First! 🔒

This guide will help you set up your environment variables securely.

## Initial Setup

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to Settings → API
   - Copy your credentials:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose)
     - Service Role key → `SUPABASE_SERVICE_ROLE_[KEY]` (KEEP SECRET!)

3. **Update `.env.local` with your actual values**

## Security Checklist

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already configured)
- Use `.env.local.example` as a template for team members
- Rotate keys immediately if exposed
- Use different keys for development and production
- Store production keys in your hosting provider's environment variables

### ❌ DON'T:
- Never commit `.env.local` to git
- Never share service role keys publicly
- Never hardcode secrets in your code
- Never log environment variables to console in production

## Pre-commit Hook Protection

A git pre-commit hook has been installed that will:
- Block commits containing `.env.local` or similar files
- Scan for exposed secrets and API keys
- Alert you before any sensitive data is committed

To test the hook:
```bash
# This should fail (good!)
echo "SUPABASE_SERVICE_ROLE_[KEY]=sb_secret_example" > test.txt
git add test.txt
git commit -m "test" # Should be blocked!
rm test.txt
```

## Production Deployment

### Netlify
Add environment variables in Netlify Dashboard:
1. Site Settings → Environment variables
2. Add each variable from `.env.local`
3. Deploy

### Vercel
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_[KEY]
```

## If Keys Are Exposed

1. **Immediately rotate keys in Supabase:**
   - Dashboard → Settings → API → Generate new JWT Secret
   - Update all environment variables
   - Redeploy your application

2. **Check for unauthorized access:**
   - Review Supabase logs
   - Check database for unexpected changes
   - Monitor usage/billing

## Environment Variable Reference

| Variable | Public? | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_[KEY]` | **NO** | Secret key with full access |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Yes | Google Analytics ID (optional) |

## Questions?

The pre-commit hook will catch most issues, but always double-check before pushing!