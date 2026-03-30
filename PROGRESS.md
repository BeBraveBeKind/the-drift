# Switchboard - Development Progress Log

## Session: 2026-03-29

### Accomplished
- **Fixed timezone bug in freshness indicators**: "Updated today" used a rolling 24-hour window instead of calendar days — a 10pm upload still showed "today" at 9am the next morning
- Created `calendarDaysAgo()` helper in `lib/utils.ts` using `Intl.DateTimeFormat` with `America/Chicago` (Central time) for proper calendar-day comparison
- Updated 3 consumer components: `FreshnessIndicator.tsx`, `PhotoPrompt.tsx`, `UploadFlow.tsx`
- Build verified clean

### Decisions
- `America/Chicago` is the canonical timezone for all freshness calculations (Viroqua-focused app)

### Files Changed
| File | Action | Description |
|------|--------|-------------|
| `lib/utils.ts` | Edited | Added `calendarDaysAgo()` with Central time |
| `components/FreshnessIndicator.tsx` | Edited | Uses `calendarDaysAgo` instead of rolling hours |
| `components/PhotoPrompt.tsx` | Edited | Uses `calendarDaysAgo` instead of inline calc |
| `components/UploadFlow.tsx` | Edited | Uses `calendarDaysAgo` instead of inline calc |

### Next Steps
- Distribute press release
- Search feature — Execute PRD
- Send /for-chambers to chamber directors

---

## Session: 2026-03-25

### Accomplished
- **Chamber networking flyer**: Created print-ready 8.5x11 two-sided PDF flyer for Viroqua chamber of commerce networking event
- Built Python generator script (`scripts/generate-flyer.py`) using ReportLab + qrcode libraries
- Iterated through 6 revisions to simplify from information-dense to punchy business format
- Front: Switchboard logo, headline ("Viroqua's bulletin boards, online."), "No app. No account. Free.", large QR code to switchboard.town
- Back: "What is Switchboard?" explainer, "For Your Business" (4 bullet benefits), "Get Involved" CTA with contact info

### Files Created (not committed)
- `scripts/generate-flyer.py` — PDF generator script
- `switchboard-flyer.pdf` — final flyer output

### Next Steps
- Print flyer for chamber networking event
- Distribute press release
- Send /for-chambers to target chamber directors

---

## Session: 2026-03-10

### Accomplished Today
- **Server component conversion**: Rewrote `app/[town]/page.tsx` from client component to async server component with `revalidate: 60` ISR, `generateMetadata()` for dynamic SEO, and a `TownContent` client island for interactivity
- **SEO infrastructure**: Created `app/sitemap.ts` (dynamic, pulls all towns/locations from Supabase), `app/robots.ts`, updated `app/layout.tsx` with `metadataBase: switchboardapp.com`, JSON-LD structured data, OG/Twitter cards
- **Parallel data fetching**: Refactored `app/[town]/[slug]/page.tsx` to use `Promise.all` for photo + other-locations queries
- **Interruptor redesign**: Rewrote from heavy bordered card to slim amber hint bar, positioned after first grid row, action-oriented copy ("Each card is a bulletin board in {townName}. Tap one to see what's posted.")
- **PhotoPrompt 4th tip**: Added "No people in the shot — just the board"
- **How-to-post improvements**: Added QR scanning instructional photo, good/bad photo comparison grid, aligned tip language with PhotoPrompt
- **Root landing page**: Added hero image, aggregate stats bar (boards + towns), instructional photos in How It Works steps
- **Gitignore cleanup**: Added 37 entries for unused asset source files, hero variants, booklet drafts, IDE config

### Commits Pushed
- `9185e3b` Convert town page to server component, add SEO infrastructure
- `0367b99` Improve instructional touchpoints: Interruptor, PhotoPrompt, how-to-post
- `18c123c` Add hero image, stats, and instructional photos to root landing page
- `94b476d` Gitignore unused asset source files, hero variants, and IDE config

### Current State
**Active Branch**: main (all pushed)
- Server-rendered town pages with client island architecture
- Full SEO infrastructure live (sitemap, robots, metadata, JSON-LD)
- Canonical domain: switchboardapp.com

### Next Steps
1. Wire `?source=qr` param into QR sign URLs as proximity trigger
2. Create dedicated maskable icon with proper safe-zone padding
3. Wait for MRRPC contest response (pitch already submitted)

### Architectural Decisions
- Client island pattern: server-render the page shell, delegate interactive grid/map/filter to `TownContent` client component
- ISR with 60s revalidation for town pages (balances freshness with performance)
- Interruptor as inline hint (col-span-full) rather than standalone card — keeps grid flow intact

---

## Session: 2026-02-22

### Accomplished Today
- Set up Claude Code context management system with CLAUDE.md and PROGRESS.md files
- Established documentation structure for persistent context across sessions
- Cleaned up experimental work from biz2 branch, returned to stable main branch
- Created comprehensive PRD for business board page redesign
- Developed 4 distinct design mockups for business board pages:
  - **Direction A**: Vibrant gradient (pink/purple) with glass morphism
  - **Direction B**: Terminal/hacker theme (black/green monospace)
  - **Direction C**: Bold red news aesthetic
  - **Direction D**: Yellow Pages theme (bright yellow/black)
- All mockups viewable at `/demo/board-redesign/`
- Installed lucide-react for modern icons

### Current State
**Active Branch**: main
- Working on business board page redesign mockups
- Dev server running on localhost:3000
- 4 design directions completed and functional
- One unpushed commit: "supabase config fixes"

### Known Issues & Blockers
- Yellow color rendering issue on Direction D (showing brown/tan instead of yellow)
- Attempted fix with inline styles using #FACC15 hex color
- May need to verify Tailwind CSS configuration for yellow classes

### Next Steps
1. Review and select winning design direction from the 4 mockups
2. Implement chosen design on actual business board pages
3. Test on real devices at 375px width
4. Ensure yellow rendering issue is resolved
5. Consider accessibility improvements (contrast ratios, touch targets)
6. Push pending commit to origin

### Architectural Decisions
- Mobile-first design targeting 375px width (iPhone SE)
- Focus on 10-second comprehension for QR code scanners
- Priority order: Business identity → Board photo → Participation CTA → Network discovery
- Removed cork board aesthetic in favor of modern, clean designs
- Using Next.js Image component for optimized photo loading

### Important Context for Next Session
- PRD located at `/PRD-business-board-redesign.md`
- Demo pages at `/app/demo/board-redesign/direction-[a-d]/page.tsx`
- Design brief emphasizes rural Wisconsin audience (40-70+ age range)
- "Real. Local. Now." tagline maintained across all designs
- Participation framed as civic duty, not content creation
- Dev server may need restart if styles aren't updating

---

## Session History

### Previous Sessions
*This is the first logged session with the new progress tracking system*

---

## How to Update This File
At the end of each session, add a new entry with:
1. Date and summary of what was done
2. Any decisions made and why
3. Blockers encountered
4. Clear next steps for the next session
5. Important context that shouldn't be lost