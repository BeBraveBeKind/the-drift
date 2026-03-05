/**
 * LocalStorage Probes — Switchboard Proof of Life
 *
 * 4 localStorage keys per switchboard-proof-of-life.md spec.
 * No PII. Random UUID for visitor_id. All client-side only.
 */

const KEYS = {
  FIRST_VISIT: 'sw_first_visit',
  VISITOR_ID: 'sw_visitor_id',
  HOW_FOUND_SHOWN: 'sw_how_found_shown',
  INTERRUPTOR_SEEN: 'sw_interruptor_seen',
} as const

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage full or blocked — silent fail
  }
}

// ── Visitor Identity ────────────────────────────────────────────────

function generateVisitorId(): string {
  return crypto.randomUUID()
}

/**
 * Initialize visitor tracking on first visit.
 * Returns { visitorId, isReturning, daysSinceFirst }.
 */
export function initVisitor(): {
  visitorId: string
  isReturning: boolean
  daysSinceFirst: number
} {
  let visitorId = getItem(KEYS.VISITOR_ID)
  const firstVisit = getItem(KEYS.FIRST_VISIT)

  if (!visitorId) {
    visitorId = generateVisitorId()
    setItem(KEYS.VISITOR_ID, visitorId)
  }

  if (!firstVisit) {
    setItem(KEYS.FIRST_VISIT, new Date().toISOString())
    return { visitorId, isReturning: false, daysSinceFirst: 0 }
  }

  const daysSinceFirst = Math.floor(
    (Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24)
  )

  return { visitorId, isReturning: daysSinceFirst >= 1, daysSinceFirst }
}

// ── How Found Prompt ────────────────────────────────────────────────

/**
 * Check if the "How did you find this?" prompt should be shown.
 * Only show once per 30 days per visitor.
 */
export function shouldShowHowFound(): boolean {
  const lastShown = getItem(KEYS.HOW_FOUND_SHOWN)
  if (!lastShown) return true

  const daysSinceShown = Math.floor(
    (Date.now() - new Date(lastShown).getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysSinceShown >= 30
}

export function markHowFoundShown(): void {
  setItem(KEYS.HOW_FOUND_SHOWN, new Date().toISOString())
}

// ── Interruptor (Town Page GIF) ─────────────────────────────────────

/**
 * Check if the "How It Works" interruptor GIF has been seen.
 * Only show once per visitor.
 */
export function hasSeenInterruptor(): boolean {
  return getItem(KEYS.INTERRUPTOR_SEEN) === 'true'
}

export function markInterruptorSeen(): void {
  setItem(KEYS.INTERRUPTOR_SEEN, 'true')
}
