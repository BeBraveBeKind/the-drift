'use client'

import { useQrVisitor } from '@/hooks/useQrVisitor'
import PhotoPrompt from './PhotoPrompt'

interface QrPhotoPromptProps {
  townSlug: string
  businessSlug: string
  lastUpdated?: string
}

/**
 * Conditionally renders PhotoPrompt for QR code visitors only.
 * Wraps the client-side QR detection so the server component
 * can include it without hooks.
 */
export default function QrPhotoPrompt({
  townSlug,
  businessSlug,
  lastUpdated,
}: QrPhotoPromptProps) {
  const isQr = useQrVisitor()

  if (!isQr) return null

  return (
    <PhotoPrompt
      townSlug={townSlug}
      businessSlug={businessSlug}
      lastUpdated={lastUpdated}
    />
  )
}
