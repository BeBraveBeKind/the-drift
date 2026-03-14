'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

/**
 * ShareButton — Switchboard Design System
 *
 * Native share on mobile, clipboard fallback on desktop.
 * De-emphasized text link style per business page copy doc.
 */
export default function ShareButton({ town, slug, name }: { town: string; slug: string; name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/${town}/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — Switchboard`, url })
        return
      } catch {
        // User cancelled or not supported
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-sm hover:underline cursor-pointer"
      style={{ color: 'var(--sb-stone)' }}
    >
      {copied ? (
        <>
          <Check size={14} />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={14} />
          Share
        </>
      )}
    </button>
  )
}
