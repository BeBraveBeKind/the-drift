# Product Requirements Document: Search Feature

## Executive Summary
Add a search function to Switchboard that lets users find businesses and boards by what's typically posted on them — not by reading the photos, but by matching against rich content-type tags maintained in the admin. No AI, no OCR. Fast Postgres full-text search over structured data.

## Background & Motivation

### Problem Statement
- Users can only discover boards by browsing a town grid or scanning a QR code
- No way to answer "where would I find info about yoga classes?" or "who posts live music events?"
- Bulletin board photos are messy (overlapping flyers, handwriting, poor lighting) — OCR is unreliable
- But the *type* of content on each board is predictable and classifiable by the board owner/admin

### Core Insight
Each business's bulletin board has a personality. The co-op posts wellness classes and local art. The library posts job listings and community meetings. The music shop posts gig posters and lesson schedules. If we tag boards with the *kinds of things* that appear on them, search becomes a solved problem without touching computer vision.

### Goals
1. Let users search across all towns/boards for content types, business names, or locations
2. Return relevant boards ranked by match quality
3. Zero AI cost — pure Postgres full-text search
4. Fast (< 200ms response time)
5. Works on mobile (search bar accessible from homepage or nav)

## User Stories

### As a community member
- I want to search "yoga classes" and find boards where that kind of thing gets posted
- I want to search "Bad Axe" and find the music shop's board directly
- I want to search "Main Street" and see all businesses on that street

### As an admin
- I want to add rich content-type tags to each location (e.g., "live music, open mic, lessons")
- I want search results to reflect my tagging immediately
- I want to see which searches return no results so I can improve tagging

### As a chamber partner
- I want to show that Switchboard makes local businesses discoverable
- Search is a concrete feature to pitch: "your members' boards become searchable"

## Technical Design

### Phase 1: Database (Supabase Migration)

**New column on `locations`:**
```sql
ALTER TABLE locations ADD COLUMN search_vector tsvector;

-- Auto-populate from name, description, address, category, and tags
CREATE OR REPLACE FUNCTION locations_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.business_category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.business_tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.address, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_locations_search_vector
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION locations_search_vector_update();

-- GIN index for fast full-text search
CREATE INDEX idx_locations_search_vector ON locations USING GIN (search_vector);

-- Backfill existing rows
UPDATE locations SET updated_at = updated_at;
```

**Weight strategy:**
- **A (highest):** Business name — exact match on name should always rank first
- **B:** Category + tags — the content-type proxy ("live music", "yoga", "job postings")
- **C:** Description — supplementary context
- **D (lowest):** Address — useful but not primary search intent

### Phase 2: Search API Route

**`/app/api/search/route.ts`**

```
GET /api/search?q=yoga+classes&town=viroqua
GET /api/search?q=live+music
```

- `q` (required): Search query string
- `town` (optional): Filter to a specific town slug
- Returns: Array of matching locations with current photo, town, relevance rank
- Uses `ts_query` with `plainto_tsquery` for natural language input
- Filters: `is_active = true`, optionally `town_id`
- Limit: 20 results, ordered by `ts_rank`

### Phase 3: Search UI

**Option A — Homepage search bar (recommended)**
- Prominent search input on the root landing page, below the hero
- "Search boards near you" placeholder
- Results page at `/search?q=...` showing matching boards as cards
- Each result shows: business name, town, category, matching tags highlighted, photo thumbnail

**Option B — Nav search**
- Search icon in Navigation component, expands to input on tap
- Same results page
- Accessible from every page

**Option C — Town page search**
- Search bar within `TownContent` client island
- Filters the existing grid client-side (no new route needed)
- Limited to current town

**Recommendation:** Start with Option A (homepage) — it's the most discoverable and the strongest pitch to chambers. Add Option C later for in-town filtering.

### Phase 4: Tag Enrichment

This is the human work that makes search useful. Each location needs content-type tags that describe what typically gets posted on their board.

**Tag taxonomy (suggested, not enforced):**

| Category | Example Tags |
|---|---|
| Events | live music, open mic, trivia night, workshops, classes, meetups, festivals |
| Services | lessons, tutoring, tax prep, childcare, pet sitting, lawn care, repairs |
| Commerce | yard sales, estate sales, for sale, wanted, free stuff, instrument sales |
| Community | volunteering, donations, church events, school events, fundraisers |
| Employment | job postings, help wanted, hiring, internships |
| Wellness | yoga, meditation, fitness, support groups, health screenings |
| Arts | local art, gallery shows, theater, film screenings, poetry |
| Government | public notices, elections, town meetings, permits |

**Admin workflow:**
- Existing `business_tags` field in LocationForm already supports array input
- Admin (you) goes through each location and adds content-type tags
- Search vector auto-updates via trigger — no extra steps

### Phase 5: Search Analytics (optional)

- Log search queries to a `search_logs` table (query, result_count, town filter, timestamp)
- Surface in admin analytics: top searches, zero-result searches
- Zero-result searches tell you which tags are missing

## Data Model Changes

| Table | Column | Type | Purpose |
|---|---|---|---|
| `locations` | `search_vector` | tsvector | Full-text search index |
| `search_logs` (new, optional) | `query`, `result_count`, `town_slug`, `created_at` | text, int, text, timestamptz | Search analytics |

## UX Considerations

- **No results state:** "No boards match that search. Try broader terms like 'music' or 'classes'."
- **Empty query:** Show popular categories as chips (quick filters, not search)
- **Mobile:** Search bar must be full-width, 44px min touch target, keyboard opens immediately on tap
- **Speed:** Postgres GIN index should return results in < 50ms at this scale (20 locations)

## What This Does NOT Include

- ❌ OCR / AI image scanning — bulletin board photos are too messy for reliable text extraction
- ❌ Per-flyer indexing — we search boards, not individual postings
- ❌ Fuzzy matching / "did you mean?" — not needed at this scale
- ❌ Location-based search (GPS proximity) — town filter is sufficient

## Success Metrics

1. Search is used (> 0 searches/week within first month)
2. Zero-result rate < 30% (indicates good tag coverage)
3. At least one chamber partner mentions search as a selling point
4. No increase in page load time for non-search pages

## Implementation Estimate

| Phase | Scope | Dependencies |
|---|---|---|
| 1. Migration | Add search_vector column + trigger + index | Supabase access |
| 2. API route | `/api/search` endpoint | Phase 1 |
| 3. Search UI | Homepage search bar + results page | Phase 2 |
| 4. Tag enrichment | Admin populates content-type tags per location | Phase 1 (can parallel with 2-3) |
| 5. Analytics | Optional search logging | Phase 2 |

## Open Questions

1. Should search be cross-town by default, or default to a specific town?
2. Should the search bar appear in the nav (every page) or just the homepage?
3. Do we want tag suggestions in admin (pre-populated list) or freeform only?
4. Should search results link to the business page or the town page with that board highlighted?
