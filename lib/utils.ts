export function getPhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board-photos/${storagePath}`
}

const SWITCHBOARD_TZ = 'America/Chicago'

/** Number of calendar days between now and a timestamp, in Central time. */
export function calendarDaysAgo(dateString: string): number {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: SWITCHBOARD_TZ }) // YYYY-MM-DD
  const todayStr = fmt.format(new Date())
  const thenStr = fmt.format(new Date(dateString))
  const todayMs = new Date(todayStr).getTime()
  const thenMs = new Date(thenStr).getTime()
  return Math.round((todayMs - thenMs) / (1000 * 60 * 60 * 24))
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}