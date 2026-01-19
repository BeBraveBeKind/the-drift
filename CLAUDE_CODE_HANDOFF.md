# Claude Code Handoff — The Drift

**What it is:** A hyperlocal app for documenting physical bulletin boards via crowdsourced photos.2

**Tagline:** "What's posted around here"

---

## Quick Start

1. Read `the-drift-spec.md` for full specification
2. Create Next.js 14 project with App Router + Tailwind
3. Create Supabase project, run ALL schema SQL (includes RPC functions + grants)
4. Build in order below

---

## Build Order

### Phase 1: Foundation
```
1. npx create-next-app@latest the-drift --typescript --tailwind --app
2. npm install @supabase/supabase-js
3. npm install -D @netlify/plugin-nextjs
4. Create netlify.toml (see spec)
5. Create lib/supabase.ts, lib/types.ts, lib/utils.ts
6. Run ALL schema SQL in Supabase (tables, RLS, RPC functions, grants)
7. Create storage bucket "board-photos" (public, 10MB limit)
```

### Phase 2: Core Pages
```
8. app/globals.css — just Tailwind imports
9. app/layout.tsx — stone-50 background
10. app/not-found.tsx — simple 404
11. app/page.tsx — Homepage with board cards
12. app/[slug]/page.tsx — Single board view
13. app/post/[slug]/page.tsx — QR upload landing
```

### Phase 3: API Routes
```
14. app/api/upload/route.ts — uses supabaseAdmin
15. app/api/view/route.ts — uses RPC (anon-safe)
16. app/api/flag/route.ts — uses RPC (anon-safe)
```

### Phase 4: Components
```
17. components/ViewTracker.tsx — fires on page load
18. components/ShareButton.tsx — native share or clipboard
19. components/FlagButton.tsx — simple flag action
```

### Phase 5: Deploy
```
20. Set env vars in Netlify (Site settings > Environment variables)
21. Deploy via Git or Netlify CLI
22. Add test locations via Supabase Dashboard
23. Test mobile camera flow end-to-end
```

---

## ⚠️ Critical: SQL Must Include RPC Functions

The schema has RPC functions that MUST be created for view/flag counting to work:

```sql
-- These are in the spec but easy to miss
create or replace function increment_view_count(loc_id uuid) ...
create or replace function increment_flag_count(p_photo_id uuid) ...

-- AND the grants (without these, anon can't call the functions)
grant execute on function increment_view_count(uuid) to anon;
grant execute on function increment_flag_count(uuid) to anon;
```

Without the grants, the API routes will fail silently.

---

## Design Notes

**Palette:** Stone (Tailwind stone-50 through stone-900)
**Vibe:** Quiet, analog, unhurried. Not slick. Not startup-y.
**Typography:** Inter via next/font. Nothing fancy.

**Copy voice:**
- "What's posted around here" not "See community updates"
- "X looks" not "X views"
- "Pinning something?" not "Upload a photo"
- "Posted to The Drift" not "Upload successful"

---

## Key Decisions

| Decision | Reasoning |
|----------|-----------|
| No auth | Friction kills adoption at 10 locations |
| View counter | Early signal — are people looking? |
| "Looks" not "views" | Warmer, less metric-y |
| No auto-hide on flags | Manual review for pilot, avoid false positives |
| RPC for counters | Atomic increments, secure, anon-callable |
| Stone palette | Earthy, analog feel — not tech blue |

---

## Test Data

Add via Supabase Dashboard after deploy:

```sql
insert into locations (name, slug, address) values
('Viroqua Food Co-op', 'viroqua-coop', '609 Main St'),
('Kickapoo Coffee', 'kickapoo-coffee', '220 S Main St'),
('Driftless Cafe', 'driftless-cafe', '118 W Court St');
```

---

## Domain

Ideal: `thedrift.town` or `drift.town`
Fallback: `thedrift.community` or Netlify subdomain for pilot

---

## Success = Answer These Questions

After 2 weeks with QR codes up:

1. Did anyone submit a photo? (Is the flow working?)
2. Did anyone visit who wasn't submitting? (Is there pull?)
3. Did anyone share? (Is it worth talking about?)
4. Did any location owner ask for more? (Is there B2B potential?)

If all four are no, kill it or pivot. If any are yes, dig in.
