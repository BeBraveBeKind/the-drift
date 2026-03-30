/**
 * FreshnessIndicator — Switchboard Design System
 *
 * The single most important trust signal on the page.
 * 7 states per switchboard-business-page-copy.md spec.
 *
 * Usage:
 *   <FreshnessIndicator updatedAt={location.updated_at} />
 *   <FreshnessIndicator updatedAt={location.updated_at} variant="badge" />
 */

import { CircleCheck, AlertTriangle, AlertCircle, CircleDashed } from 'lucide-react'
import { calendarDaysAgo } from '@/lib/utils'

type FreshnessState = 'just-now' | 'today' | 'this-week' | 'getting-stale' | 'stale' | 'very-stale' | 'never'

interface FreshnessConfig {
  label: string
  icon: typeof CircleCheck
  colorClass: string
}

function getFreshnessState(updatedAt: string | null | undefined): FreshnessState {
  if (!updatedAt) return 'never'

  const diffMs = Date.now() - new Date(updatedAt).getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const days = calendarDaysAgo(updatedAt)

  if (diffHours < 1) return 'just-now'
  if (days === 0) return 'today'
  if (days <= 7) return 'this-week'
  if (days <= 14) return 'getting-stale'
  if (days <= 30) return 'stale'
  return 'very-stale'
}

function getFreshnessConfig(state: FreshnessState, updatedAt: string | null | undefined): FreshnessConfig {
  const daysAgo = updatedAt ? calendarDaysAgo(updatedAt) : 0

  switch (state) {
    case 'just-now':
      return { label: 'Updated just now', icon: CircleCheck, colorClass: 'freshness-badge--fresh' }
    case 'today':
      return { label: 'Updated today', icon: CircleCheck, colorClass: 'freshness-badge--fresh' }
    case 'this-week':
      return { label: `Updated ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`, icon: CircleCheck, colorClass: 'freshness-badge--fresh' }
    case 'getting-stale':
      return { label: `Updated ${daysAgo} days ago`, icon: AlertTriangle, colorClass: 'freshness-badge--aging' }
    case 'stale':
      return { label: `Updated ${daysAgo} days ago`, icon: AlertTriangle, colorClass: 'freshness-badge--aging' }
    case 'very-stale':
      return { label: 'Last updated over a month ago', icon: AlertCircle, colorClass: 'freshness-badge--stale' }
    case 'never':
      return { label: 'Not yet updated', icon: CircleDashed, colorClass: 'text-[#78716C]' }
  }
}

interface FreshnessIndicatorProps {
  updatedAt: string | null | undefined
  /** "inline" for business page P1, "badge" for grid cards */
  variant?: 'inline' | 'badge'
}

export default function FreshnessIndicator({ updatedAt, variant = 'inline' }: FreshnessIndicatorProps) {
  const state = getFreshnessState(updatedAt)
  const config = getFreshnessConfig(state, updatedAt)
  const Icon = config.icon

  return (
    <span className={`freshness-badge ${config.colorClass}`}>
      <Icon size={variant === 'badge' ? 12 : 14} />
      {config.label}
    </span>
  )
}
