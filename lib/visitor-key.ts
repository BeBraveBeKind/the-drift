import { createHash } from 'node:crypto'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const centralDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** SHA-256 hex digest of salt, day, ip and user agent. */
export function visitorKey(ip: string, userAgent: string, salt: string, day: string): string {
  return createHash('sha256').update(`${salt}|${day}|${ip}|${userAgent}`).digest('hex')
}

/** Client IP from the Netlify header, else the first x-forwarded-for entry, else 'unknown'. */
export function clientIp(headers: Headers): string {
  const netlifyIp = headers.get('x-nf-client-connection-ip')?.trim()
  if (netlifyIp) return netlifyIp
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || 'unknown'
}

/** Calendar date (YYYY-MM-DD) in America/Chicago. */
export function centralDay(now: Date): string {
  return centralDateFormat.format(now)
}

/** True for any canonical 8-4-4-4-12 hex UUID string. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/** Maps a database error to a flag result; unique violation (23505) is a duplicate. */
export function flagOutcome(error: { code?: string } | null): 'count' | 'duplicate' | 'error' {
  if (!error) return 'count'
  return error.code === '23505' ? 'duplicate' : 'error'
}
