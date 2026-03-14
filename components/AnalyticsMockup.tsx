/**
 * AnalyticsMockup — static visual mockup of a Plausible-style analytics dashboard.
 * Used on the /for-chambers page to show Carol what reporting looks like.
 * Pure CSS, no JS, no client component needed.
 */

const BAR_DATA = [
  { label: 'Mon', value: 28 },
  { label: 'Tue', value: 42 },
  { label: 'Wed', value: 35 },
  { label: 'Thu', value: 51 },
  { label: 'Fri', value: 38 },
  { label: 'Sat', value: 19 },
  { label: 'Sun', value: 24 },
]

const TOP_BOARDS = [
  { name: 'Viroqua Food Co-op', views: 64, pct: 100 },
  { name: 'Wonderstate Coffee', views: 47, pct: 73 },
  { name: 'County Seat Laundry', views: 41, pct: 64 },
  { name: 'McIntosh Memorial Library', views: 38, pct: 59 },
  { name: 'Driftless Books', views: 29, pct: 45 },
]

export default function AnalyticsMockup() {
  const maxVal = Math.max(...BAR_DATA.map((d) => d.value))

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        fontSize: '14px',
        lineHeight: '1.4',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
            switchboard.town/viroqua
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Last 7 days</span>
      </div>

      {/* Stats row — forced horizontal with flexbox */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {[
          { label: 'Visitors', value: '237', trend: '+471%' },
          { label: 'Page Views', value: '841', trend: '+205%' },
          { label: 'Avg. Duration', value: '4m 10s', trend: null },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: '1 1 0%',
              textAlign: 'center',
              padding: '14px 8px',
              borderRight: i < 2 ? '1px solid #e5e7eb' : 'none',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: '1.2',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {stat.label}
              {stat.trend && (
                <span style={{ color: '#22c55e', fontWeight: 600, marginLeft: '4px' }}>
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: '90px',
          }}
        >
          {BAR_DATA.map((d) => (
            <div
              key={d.label}
              style={{
                flex: '1 1 0%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '48px',
                  borderRadius: '3px 3px 0 0',
                  background: '#F59E0B',
                  height: `${Math.round((d.value / maxVal) * 70)}px`,
                  minHeight: '6px',
                }}
              />
              <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1' }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 16px 0' }} />

      {/* Top boards */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Top Boards</span>
          <span>Views</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TOP_BOARDS.map((board) => (
            <div
              key={board.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  flex: '1 1 0%',
                  position: 'relative',
                  height: '28px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Background bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${board.pct}%`,
                    background: '#FEF3C7',
                    borderRadius: '4px',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e293b',
                    padding: '0 10px',
                    lineHeight: '28px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {board.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1e293b',
                  minWidth: '32px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {board.views}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
