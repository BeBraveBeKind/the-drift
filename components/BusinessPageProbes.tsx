'use client'

import { useEffect, useRef } from 'react'
import { trackPageLoaded, trackOrientScroll, trackActionTap, trackReturnVisit } from '@/lib/plausible'
import { initVisitor } from '@/lib/probes'

/**
 * BusinessPageProbes — PoL event wiring for the business page.
 *
 * Probe 1: page_loaded — fires on mount with load time + entry source
 * Probe 2: orient_scroll — fires once when user first scrolls
 * Probe 3: action_tap — fires when Call/Directions/Website tapped (via event delegation)
 * Probe 4: return_visit — fires if visitor has been here before (daysSinceFirst >= 1)
 *
 * Render this component once on the business page. Invisible.
 */
export default function BusinessPageProbes({ businessSlug }: { businessSlug: string }) {
  const loadTime = useRef(Date.now())
  const scrollFired = useRef(false)

  useEffect(() => {
    // ── Probe 1: Heartbeat ──
    const loadMs = Date.now() - loadTime.current
    trackPageLoaded(businessSlug, loadMs)

    // ── Probe 4: Return Visit ──
    const visitor = initVisitor()
    if (visitor.isReturning) {
      trackReturnVisit(visitor.visitorId, visitor.daysSinceFirst)
    }

    // ── Probe 2: Orient Scroll ──
    function handleScroll() {
      if (scrollFired.current) return
      scrollFired.current = true
      const scrollMs = Date.now() - loadTime.current
      trackOrientScroll(businessSlug, scrollMs)
      window.removeEventListener('scroll', handleScroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // ── Probe 3: Action Tap (event delegation) ──
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const link = target.closest('a[data-action]') as HTMLAnchorElement | null
      if (!link) return

      const action = link.dataset.action as 'call' | 'directions' | 'website' | undefined
      if (action) {
        const tapMs = Date.now() - loadTime.current
        trackActionTap(businessSlug, action, tapMs)
      }
    }
    document.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
    }
  }, [businessSlug])

  return null
}
