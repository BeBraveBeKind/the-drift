/**
 * Plausible Analytics — Custom Event Tracking
 *
 * 7 custom events per switchboard-proof-of-life.md spec.
 * Each event fires with 1-3 string/number properties. No PII.
 *
 * Plausible script loaded in layout.tsx via:
 *   <script defer data-domain="switchboard.town" src="https://plausible.io/js/script.js" />
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void
  }
}

function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined)
  }
}

// ── Probe 1: Heartbeat ──────────────────────────────────────────────
export function trackPageLoaded(businessSlug: string, loadTimeMs: number) {
  const params = new URLSearchParams(window.location.search)
  const entrySource = params.get('src') === 'qr' ? 'qr' : document.referrer ? 'referral' : 'direct'
  track('page_loaded', {
    business_slug: businessSlug,
    load_time_ms: loadTimeMs,
    entry_source: entrySource,
  })
}

// ── Probe 2: Two-Second Orient ──────────────────────────────────────
export function trackOrientScroll(businessSlug: string, timeToScrollMs: number) {
  track('orient_scroll', {
    business_slug: businessSlug,
    time_to_scroll_ms: timeToScrollMs,
  })
}

// ── Probe 3: First Tap ──────────────────────────────────────────────
export function trackActionTap(businessSlug: string, actionType: 'website' | 'call' | 'directions', timeSinceLoadMs: number) {
  track('action_tap', {
    action_type: actionType,
    time_since_load_ms: timeSinceLoadMs,
    business_slug: businessSlug,
  })
}

// ── Probe 4: Return Visit ───────────────────────────────────────────
export function trackReturnVisit(visitorId: string, daysSinceFirst: number) {
  const params = new URLSearchParams(window.location.search)
  const entrySource = params.get('src') === 'qr' ? 'qr' : 'direct'
  track('return_visit', {
    visitor_id: visitorId,
    days_since_first: daysSinceFirst,
    entry_source: entrySource,
  })
}

// ── Probe 5: Geo-Fence Gate ─────────────────────────────────────────
export function trackGeofenceResult(businessSlug: string, result: 'active' | 'denied' | 'unavailable') {
  track('geofence_result', {
    result,
    business_slug: businessSlug,
  })
}

// ── Probe 5 & 6: Photo Upload ───────────────────────────────────────
export function trackPhotoUpload(businessSlug: string, status: 'started' | 'completed' | 'failed') {
  track('photo_upload', {
    status,
    business_slug: businessSlug,
  })
}

// ── Probe 7: Attribution ────────────────────────────────────────────
export function trackHowFound(businessSlug: string, answer: 'qr' | 'word-of-mouth' | 'online' | 'browsing') {
  track('how_found', {
    answer,
    business_slug: businessSlug,
  })
}
