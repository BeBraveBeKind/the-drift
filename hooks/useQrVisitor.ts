'use client'

import { useState, useEffect } from 'react'

/**
 * Detects whether the current visitor arrived via QR code scan.
 *
 * Detection logic (any of these = QR visitor):
 * 1. URL has ?src=qr (new signs)
 * 2. Mobile device + no referrer + business page (existing printed signs)
 *
 * Returns true only on business pages (/{town}/{slug}).
 */
export function useQrVisitor(): boolean {
  const [isQr, setIsQr] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Explicit QR param (new signs)
    if (params.get('src') === 'qr') {
      setIsQr(true)
      return
    }

    // Heuristic for existing printed signs:
    // Mobile + no referrer = almost certainly a QR scan
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const noReferrer = !document.referrer

    if (isMobile && noReferrer) {
      setIsQr(true)
    }
  }, [])

  return isQr
}
