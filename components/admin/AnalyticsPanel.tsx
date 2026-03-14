'use client'

import { useState, useEffect } from 'react'

interface OverviewData {
  results: Array<{ metrics: number[] }>
}

interface BreakdownData {
  results: Array<{ dimensions: string[]; metrics: number[] }>
}

interface TimeseriesData {
  results: Array<{ dimensions: string[]; metrics: number[] }>
}

interface AnalyticsState {
  overview: { visitors: number; pageviews: number; bounceRate: number; avgDuration: number; visits: number } | null
  realtime: number | null
  pages: Array<{ page: string; visitors: number; pageviews: number }>
  sources: Array<{ source: string; visitors: number }>
  timeseries: Array<{ date: string; visitors: number; pageviews: number }>
  events: Array<{ name: string; visitors: number; count: number }>
  loading: boolean
  error: string | null
}

export default function AnalyticsPanel() {
  const [period, setPeriod] = useState('30d')
  const [state, setState] = useState<AnalyticsState>({
    overview: null,
    realtime: null,
    pages: [],
    sources: [],
    timeseries: [],
    events: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function fetchQuery(q: string) {
    const res = await fetch(`/api/admin/analytics?q=${q}&period=${period}`)
    if (!res.ok) throw new Error(`Failed to fetch ${q}`)
    return res.json()
  }

  async function loadAnalytics() {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [overviewRes, realtimeRes, pagesRes, sourcesRes, timeseriesRes, eventsRes] = await Promise.all([
        fetchQuery('overview'),
        fetchQuery('realtime'),
        fetchQuery('pages'),
        fetchQuery('sources'),
        fetchQuery('timeseries'),
        fetchQuery('events'),
      ])

      // Parse overview (single row, metrics in order: visitors, pageviews, bounce_rate, visit_duration, visits)
      const om = overviewRes.results?.[0]?.metrics || []
      const overview = {
        visitors: om[0] || 0,
        pageviews: om[1] || 0,
        bounceRate: om[2] || 0,
        avgDuration: om[3] || 0,
        visits: om[4] || 0,
      }

      // Parse pages
      const pages = (pagesRes.results || []).map((r: { dimensions: string[]; metrics: number[] }) => ({
        page: r.dimensions[0],
        visitors: r.metrics[0],
        pageviews: r.metrics[1],
      }))

      // Parse sources
      const sources = (sourcesRes.results || []).map((r: { dimensions: string[]; metrics: number[] }) => ({
        source: r.dimensions[0] || 'Direct / None',
        visitors: r.metrics[0],
      }))

      // Parse timeseries
      const timeseries = (timeseriesRes.results || []).map((r: { dimensions: string[]; metrics: number[] }) => ({
        date: r.dimensions[0],
        visitors: r.metrics[0],
        pageviews: r.metrics[1],
      }))

      // Parse events
      const events = (eventsRes.results || []).map((r: { dimensions: string[]; metrics: number[] }) => ({
        name: r.dimensions[0],
        visitors: r.metrics[0],
        count: r.metrics[1],
      }))

      setState({
        overview,
        realtime: realtimeRes.realtime_visitors ?? 0,
        pages,
        sources,
        timeseries,
        events,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Analytics load error:', err)
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load analytics',
      }))
    }
  }

  if (state.error) {
    return (
      <div
        className="rounded-lg p-6 mb-8"
        style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--sb-charcoal)' }}>Analytics</h2>
        <div
          className="rounded-md p-4"
          style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
        >
          <p className="text-sm font-medium" style={{ color: '#92400E' }}>
            Could not load analytics
          </p>
          <p className="text-sm mt-1" style={{ color: '#A16207' }}>
            {state.error}. Make sure <code style={{ background: '#FDE68A', padding: '1px 4px', borderRadius: '3px' }}>PLAUSIBLE_API_KEY</code> is set in your environment variables.
          </p>
        </div>
      </div>
    )
  }

  if (state.loading) {
    return (
      <div
        className="rounded-lg p-6 mb-8"
        style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
      >
        <div className="text-sm" style={{ color: 'var(--sb-stone)' }}>Loading analytics...</div>
      </div>
    )
  }

  const { overview, realtime, pages, sources, timeseries, events } = state
  const maxVisitors = Math.max(...timeseries.map(d => d.visitors), 1)

  return (
    <div className="mb-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--sb-charcoal)' }}>Analytics</h2>
          {realtime !== null && realtime > 0 && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: '#DCFCE7', color: '#166534' }}
            >
              {realtime} live now
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '6mo', '12mo'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                background: period === p ? 'var(--sb-amber)' : 'var(--sb-white)',
                color: period === p ? 'var(--sb-charcoal)' : 'var(--sb-stone)',
                border: period === p ? 'none' : '1px solid var(--sb-warm-gray)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <StatCard label="Visitors" value={overview?.visitors ?? 0} />
        <StatCard label="Pageviews" value={overview?.pageviews ?? 0} />
        <StatCard label="Visits" value={overview?.visits ?? 0} />
        <StatCard label="Bounce Rate" value={`${overview?.bounceRate ?? 0}%`} />
        <StatCard label="Avg Duration" value={formatDuration(overview?.avgDuration ?? 0)} />
      </div>

      {/* Sparkline */}
      {timeseries.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--sb-stone)' }}>
            Daily Visitors
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
            {timeseries.map((d, i) => (
              <div
                key={i}
                title={`${d.date}: ${d.visitors} visitors`}
                style={{
                  flex: 1,
                  height: `${Math.max((d.visitors / maxVisitors) * 100, 4)}%`,
                  background: 'var(--sb-amber)',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8,
                  transition: 'opacity 150ms',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--sb-stone)' }}>
              {timeseries[0]?.date ? formatDate(timeseries[0].date) : ''}
            </span>
            <span className="text-xs" style={{ color: 'var(--sb-stone)' }}>
              {timeseries[timeseries.length - 1]?.date ? formatDate(timeseries[timeseries.length - 1].date) : ''}
            </span>
          </div>
        </div>
      )}

      {/* Bottom grid: pages, sources, events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Top Pages */}
        <ListCard title="Top Pages" items={pages.slice(0, 10).map(p => ({
          label: prettifyPage(p.page),
          value: p.visitors,
          sub: `${p.pageviews} views`,
        }))} />

        {/* Sources */}
        <ListCard title="Sources" items={sources.slice(0, 8).map(s => ({
          label: s.source,
          value: s.visitors,
        }))} />

        {/* Custom Events */}
        {events.length > 0 && (
          <ListCard title="Custom Events" items={events.map(e => ({
            label: e.name,
            value: e.count,
            sub: `${e.visitors} unique`,
          }))} />
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--sb-stone)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--sb-charcoal)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: Array<{ label: string; value: number; sub?: string }> }) {
  const max = Math.max(...items.map(i => i.value), 1)

  return (
    <div
      className="rounded-lg"
      style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)', overflow: 'hidden' }}
    >
      <div className="p-3" style={{ borderBottom: '1px solid var(--sb-warm-gray)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--sb-charcoal)' }}>{title}</p>
      </div>
      <div>
        {items.length === 0 && (
          <div className="p-3 text-sm" style={{ color: 'var(--sb-stone)' }}>No data</div>
        )}
        {items.map((item, i) => (
          <div
            key={i}
            className="px-3 py-2 flex items-center justify-between"
            style={{
              background: i % 2 === 1 ? '#F8F5F0' : 'transparent',
              borderBottom: i < items.length - 1 ? '1px solid #F0EDE8' : 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Background bar */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: 0,
                    height: '24px',
                    width: `${(item.value / max) * 100}%`,
                    background: 'var(--sb-amber)',
                    opacity: 0.1,
                    borderRadius: '3px',
                  }}
                />
                <span className="text-sm relative" style={{ color: 'var(--sb-charcoal)' }}>
                  {item.label}
                </span>
              </div>
            </div>
            <div className="text-right ml-3" style={{ flexShrink: 0 }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--sb-charcoal)' }}>
                {item.value.toLocaleString()}
              </span>
              {item.sub && (
                <span className="text-xs ml-2" style={{ color: 'var(--sb-stone)' }}>{item.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function prettifyPage(page: string): string {
  if (page === '/') return 'Home'
  return page.replace(/^\//, '').replace(/\//g, ' / ')
}
