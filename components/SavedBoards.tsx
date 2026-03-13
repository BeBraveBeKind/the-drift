'use client'

import { useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronRight } from 'lucide-react'
import type { LocationWithPhoto } from '@/types'

interface SavedBoardsProps {
  boards: LocationWithPhoto[]
  townSlug: string
}

/**
 * Shows boards the user has saved via the post-upload flow.
 * Reads from localStorage `sb-saved-boards` — no account required.
 * Only renders if the user has saved boards in this town.
 */
export default function SavedBoards({ boards, townSlug }: SavedBoardsProps) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener('storage', cb)
    return () => window.removeEventListener('storage', cb)
  }, [])
  const getSnapshot = useCallback(
    () => localStorage.getItem('sb-saved-boards') || '[]',
    []
  )
  const getServerSnapshot = useCallback(() => '[]', [])
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  let savedSlugs: string[] = []
  try {
    savedSlugs = (JSON.parse(raw) as string[])
      .filter((key) => key.startsWith(`${townSlug}/`))
      .map((key) => key.split('/')[1])
  } catch {
    // malformed localStorage
  }

  if (savedSlugs.length === 0) return null

  const savedBoards = boards.filter((b) => savedSlugs.includes(b.slug))
  if (savedBoards.length === 0) return null

  return (
    <div className="max-w-[640px] mx-auto px-4 mb-6">
      <div
        className="p-4"
        style={{
          background: 'var(--sb-white)',
          border: '1px solid var(--sb-warm-gray)',
          borderRadius: 'var(--sb-radius)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={14} style={{ color: 'var(--sb-amber)' }} fill="var(--sb-amber)" />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            Your boards
          </h3>
        </div>
        <div className="space-y-0">
          {savedBoards.map((board) => (
            <Link
              key={board.slug}
              href={`/${townSlug}/${board.slug}`}
              className="flex items-center justify-between py-2.5 no-underline"
              style={{
                borderBottom: '1px solid var(--sb-warm-gray)',
                color: 'var(--sb-slate)',
                minHeight: '44px',
              }}
            >
              <span className="text-sm">{board.name}</span>
              <ChevronRight size={14} style={{ color: 'var(--sb-stone)' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
