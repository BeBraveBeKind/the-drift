'use client'

import { useState } from 'react'

export default function ShareButton({ town, slug, name }: { town: string, slug: string, name: string }) {
  const [copied, setCopied] = useState(false)
  
  async function handleShare() {
    const url = `${window.location.origin}/${town}/${slug}`
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — Switchboard`,
          url
        })
        return
      } catch {
        // User cancelled or not supported
      }
    }
    
    // Fallback to clipboard
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleShare}
      className="text-stone-400 hover:text-stone-600 text-sm"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}