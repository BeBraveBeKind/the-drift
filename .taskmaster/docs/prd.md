# PRD: Unified Upload Photo Experience

**Status**: Draft
**Date**: 2026-03-13
**Author**: AI-assisted
**Priority**: High — core user action

---

## 1. Problem Statement

The path from "I want to update this board" to "photo uploaded" crosses **three disconnected screens** with inconsistent design, confusing context switches, and leftover debug artifacts. A user standing at a bulletin board with their phone should feel guided through a single, confident flow — not dropped into a different app at each step.

### Current Journey (4 screens, 3 design languages)

| Step | Screen | Design Language | Problems |
|------|--------|----------------|----------|
| 1 | **Business page** (`/[town]/[slug]`) | Switchboard design system (amber, charcoal, Plus Jakarta Sans) | QR Photo Prompt shows for QR visitors — good gatekeeping, but the handoff to the next screen breaks the flow. |
| 2 | **PhotoPrompt component** | Charcoal card, amber CTA, rotating tips | Good design but disconnected from what comes next. CTA says "Take a Photo" but navigates away. |
| 3 | **Post page** (`/post/[town]/[slug]`) | `bg-stone-50`, `bg-stone-900` button, emoji icon, debug info visible | Completely different visual language. Gray background. Dark button instead of amber. Debug div showing Town/Slug. No context about which business. No tips. |
| 4 | **Success state** | Centered emoji 📌, no branding | No Switchboard branding. Brief flash before redirect. No confirmation of what was uploaded or where. |

### Key Pain Points

1. **Visual whiplash**: PhotoPrompt is dark/amber, post page is gray/stone — feels like a different app
2. **Lost context**: Post page doesn't show the business name, address, or current photo — user wonders "am I in the right place?"
3. **Debug noise**: Town/slug debug div is visible to production users
4. **No preview**: User can't see what they captured before it's uploaded
5. **Wasted peak engagement**: 📌 emoji + "Posted to Switchboard" with no branding, no share option, no save option. The user just contributed — they're at peak engagement — and we redirect them away in 1.5 seconds with nothing to show for it
6. **Tips shown too early**: PhotoPrompt shows rotating tips *before* the user decides to take a photo — they haven't committed yet, so the tips are noise. Tips should appear *after* the user taps "Take a Photo", when they're about to frame the shot

---

## 2. Target User

A community member standing at a physical bulletin board, smartphone in hand. They **scanned the QR code** on the board and landed on the business page. They're mobile, in a hurry, and need the flow to feel like one smooth action.

Upload is a **QR-visitor-only action** by design. This is intentional — the QR code proves physical presence at the board, which is the core trust signal. Organic web visitors browse and consume; QR visitors contribute.

---

## 3. Proposed Solution

**Keep the QR-only gate. Fix everything after the tap.** The PhotoPrompt on the business page is the right trigger — but what happens after "Take a Photo" needs to feel like a guided, single-page experience instead of a jarring context switch.

### Design Principles

- **QR = permission to contribute**: Only QR visitors see the upload prompt. This stays.
- **Tips at the moment of action**: Show photo tips *after* the user taps "Take a Photo" and *before* the camera opens — when they're about to frame the shot and the tips are actionable.
- **Visual continuity**: Every screen in the flow uses the Switchboard design system. No stone/gray, no emoji icons, no debug artifacts.
- **Context preserved**: The user always knows which business they're updating.
- **Progressive disclosure**: Prompt → Tips → Camera → Preview → Upload → Share/Save → Done
- **Capture peak engagement**: Post-upload is the highest-intent moment in the product. Offer share and save before redirecting.

---

## 4. Detailed Requirements

### 4.1 Redesign the Post Page (`/post/[town]/[slug]`)

This is where the user lands after tapping "Take a Photo" on the business page. Currently it's a disconnected gray page with a dark button and debug info. Redesign it as a **two-step guided flow**:

#### Step 1: Tips Screen (shown first, before camera opens)

When the user arrives at `/post/[town]/[slug]`, they see:

- **Business context header**: "{Business Name}" in bold, with town name subtitle — so the user knows they're in the right place
- **Freshness context**: "Last updated 3 days ago" or "Never been photographed" — motivates action
- **Photo tips** — the 4 tips currently buried in PhotoPrompt's rotating ticker, shown as a static checklist:
  - Step back — get the whole board in frame
  - Shoot straight on — avoid angles
  - Good light — make sure flyers are readable
  - No people in the shot — just the board
- **Good/bad photo comparison** — reuse the tip-1.webp/tip-2.webp images from `/how-to-post` as a compact inline comparison
- **Primary CTA**: "Open Camera" (amber, Lucide Camera icon) — triggers the file input
- **Secondary**: "Cancel" link back to the business page

This screen replaces the current "Snap a photo of the board" + debug div + dark button. The tips that were previously shown *before the decision to act* (in PhotoPrompt) now appear *at the moment of action* — when the user is standing at the board, about to frame the shot.

#### Step 2: Preview + Upload (after photo is taken)

After the camera returns a photo:

- **Preview**: Show the captured image in the same aspect/container style as the business page board photo (warm-white background, 1px warm-gray border, 8px radius)
- **Business name** stays visible above
- **Two buttons**: "Upload to Switchboard" (amber, primary) and "Retake" (secondary, border-only)
- **Uploading state**: Amber spinner/progress with "Uploading..." — buttons disabled
- **Success state**: Switchboard-branded confirmation with business name: "Posted to {Business Name}" — then auto-redirect to business page after 2 seconds
- **Error state**: Clear error message with "Try again" button

### 4.2 Post-Upload Success Screen (Share & Save)

The current success state is a 📌 emoji and a 1.5-second redirect. Replace it with a branded screen that captures the user's peak engagement.

**What the user sees after upload completes:**

- **Branded confirmation**: "Posted to {Business Name}" — Switchboard styled, not generic
- **Photo preview**: The image they just uploaded, displayed in the same board-photo style
- **"Share with friends" button** (primary):
  - Triggers `navigator.share()` (Web Share API) on mobile — opens native OS share sheet (iMessage, WhatsApp, Instagram Stories, etc.)
  - Share payload: text "I just updated the {Business Name} board on Switchboard — see what's posted in {Town}!" + URL `https://switchboard.town/{town}/{slug}?ref=share`
  - Fallback for browsers without Web Share API: copy URL to clipboard with toast "Link copied!"
  - `?ref=share` param enables tracking share-driven visits
- **"Save this board" button** (secondary):
  - Saves the business slug to localStorage under a `sb-saved-boards` key
  - Shows confirmation: "Saved — you'll see this board on your {Town} page"
  - Enables a future "Your boards" section at the top of the town page for returning visitors
  - No account required — localStorage only
- **"View the board →" link**: navigates to business page (user-initiated, not auto-redirect)
- **Auto-redirect after 10 seconds** if no interaction — don't trap the user, but give them time to act

**Why this matters for growth:**
- Each share reaches people in the same small town who actually pass these boards
- "I just updated the board" is social proof, not an ad — it's authentic
- Save creates a return-visit hook without requiring auth
- `?ref=share` tracking lets us measure the viral loop: upload → share → visit → QR scan → upload

### 4.3 Clean Up PhotoPrompt

The PhotoPrompt component on the business page becomes simpler:

- **Keep**: QR-only gate, freshness message, dismiss behavior, charcoal card styling
- **Remove**: Rotating tips (moved to post page where they're more useful)
- **Simplify CTA copy**: "Take a Photo" stays — it navigates to the redesigned `/post/` page
- The handoff is now clean: PhotoPrompt motivates ("This board needs you"), post page guides ("Here's how to take a good photo"), camera captures, preview confirms

### 4.3 Remove Debug Artifacts

- Remove the debug div showing Town/Slug (lines 104-108 of current post page)
- Remove `console.log` debug statements or gate behind `process.env.NODE_ENV`

### 4.4 Add Business Context to Post Page

- Fetch the location name and freshness data server-side (or pass via URL params/query)
- Display at the top of the post page so the user has continuity from the business page they just left

### 4.5 Consistent Visual Language

All upload-related UI must use:
- Background: `var(--sb-warm-white)` (page) and `var(--sb-charcoal)` (PhotoPrompt card)
- Primary CTA: `var(--sb-amber)` background, `var(--sb-charcoal)` text, 8px radius
- Secondary CTA: transparent background, `var(--sb-warm-gray)` border
- Font: Plus Jakarta Sans (inherited from page)
- Icons: Lucide (already in use) — `Camera` icon, not 📷 emoji
- No `bg-stone-*` or `text-stone-*` from Tailwind defaults
- Border radius: `var(--sb-radius)` everywhere

---

## 5. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Upload completion rate | Unknown (no tracking) | Track and establish baseline, then improve 30% |
| Time from CTA tap to upload complete | ~8s (includes page load) | <6s (same-page flow, tips screen adds ~3s of useful guidance) |
| Error rate on upload | Unknown | <5% of attempts |
| Photos uploaded per week | Baseline TBD | 2x within 30 days of shipping |
| Share rate (uploads that trigger share) | 0% (no share option) | 20%+ of uploads |
| Share-driven visits (`?ref=share`) | 0 | Track and grow — leading indicator of viral loop |
| Save rate (uploads that save the board) | 0% (no save option) | 30%+ of uploads |
| Return visits from users with saved boards | 0 | Track — measures retention without auth |

---

## 6. Technical Constraints

- Must work on iOS Safari and Android Chrome (primary mobile browsers)
- HEIC/HEIF files must be handled (already fixed server-side, client skips compression)
- Max upload size: Netlify function timeout is 26s, images processed by sharp to <1MB
- Existing QR cards link to `/post/[town]/[slug]` — that route must continue working
- ISR revalidation is 60s — new photo may not appear for other users immediately

---

## 7. Out of Scope

- User accounts or authentication
- Photo approval workflow (existing flag system is sufficient)
- Multiple photo upload
- Photo editing/cropping before upload
- Push notifications for stale boards

---

## 8. Implementation Tasks

### Phase 1: Clean up post page (quick wins)

1. **Remove debug div** from post page (lines 104-108)
2. **Remove/gate console.log** debug statements
3. **Add business name + freshness** to post page header — fetch location data using town/slug params

### Phase 2: Redesign post page as guided flow

4. **Build tips screen** — static tip checklist + good/bad photo comparison (reuse tip-1.webp/tip-2.webp), shown before camera opens
5. **Restyle post page** to Switchboard design system: `var(--sb-warm-white)` background, amber CTA with Lucide Camera icon, Plus Jakarta Sans, `var(--sb-radius)` borders
6. **Add photo preview step** — after camera returns, show preview with "Upload to Switchboard" (amber) and "Retake" (border) buttons
7. **Branded success state** — "Posted to {Business Name}" with Switchboard styling, auto-redirect after 2s

### Phase 3: Post-upload share & save (growth loop)

8. **Build success screen** — branded "Posted to {Business Name}" with photo preview, replacing emoji + auto-redirect
9. **Add "Share with friends"** — `navigator.share()` with fallback to copy-to-clipboard. Share text includes business name and `?ref=share` URL.
10. **Add "Save this board"** — localStorage `sb-saved-boards` array. Confirmation toast.
11. **Add "Your boards" section** to town page — reads from localStorage, shows saved boards at the top for returning visitors

### Phase 4: Simplify PhotoPrompt

12. **Remove rotating tips** from PhotoPrompt — they now live on the post page where they're actionable
13. **Simplify PhotoPrompt** to: freshness message + "Take a Photo" CTA + dismiss. Keep charcoal card, QR-only gate, localStorage dismiss.

### Phase 5: Polish & measurement

14. **Add upload progress indicator** — amber spinner or bar during upload
15. **Specific error messages** — network error, timeout, unsupported format, server error (with "Try again" button)
16. **Add analytics events** — track: CTA shown, CTA tapped, camera opened, upload started, upload succeeded/failed, share tapped, share completed, save tapped, `?ref=share` visits

### User Test Checkpoint

After Phase 2: Test with 2-3 real users at a bulletin board location. Observe the full flow from QR scan to uploaded photo. Note any hesitation or confusion points.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Tips screen adds friction (extra tap before camera) | Keep it concise — checklist + comparison should take <5 seconds to scan. "Open Camera" button is prominent. Can A/B test skipping tips for repeat visitors via localStorage. |
| Users confused by preview step (extra tap) | Preview builds confidence ("is this a good photo?") and prevents accidental uploads. Can be skipped in future if data shows drop-off. |
| Large HEIC files slow on mobile data | Server-side sharp processing already handles optimization. Show "Processing..." state for HEIC. |
| Post page needs business data but is a client component | Fetch business name/freshness via API call or pass as URL search params from PhotoPrompt link. |
