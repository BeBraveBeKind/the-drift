'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, CheckCircle, X, Share2, Bookmark, ArrowLeft, Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/imageCompression'

type FlowStep = 'tips' | 'preview' | 'uploading' | 'success' | 'error'

interface UploadFlowProps {
  townSlug: string
  businessSlug: string
  businessName: string
  townName: string
  lastUpdated?: string
}

const TIPS = [
  'Step back — get the whole board in frame',
  'Shoot straight on — avoid angles',
  'Good light — make sure flyers are readable',
  'No people in the shot — just the board',
]

function getFreshnessMessage(lastUpdated?: string): string {
  if (!lastUpdated) return 'This board has never been photographed.'
  const days = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return 'Updated today — keep it fresh!'
  if (days === 1) return 'Updated yesterday.'
  if (days < 7) return `Updated ${days} days ago.`
  if (days < 30) return `Updated ${Math.floor(days / 7)} weeks ago — time for a refresh.`
  return `Last updated ${days} days ago — this board needs you.`
}

export default function UploadFlow({
  townSlug,
  businessSlug,
  businessName,
  townName,
  lastUpdated,
}: UploadFlowProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<FlowStep>('tips')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up preview URL and auto-redirect on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current)
    }
  }, [previewUrl])

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setSelectedFile(file)
    setStep('preview')
  }, [])

  const handleRetake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
    setStep('tips')
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [previewUrl])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    setStep('uploading')
    setError(null)

    try {
      const isHEIC = /\.(heic|heif)$/i.test(selectedFile.name) ||
                     selectedFile.type === 'image/heic' || selectedFile.type === 'image/heif'

      let uploadFile: File

      if (isHEIC) {
        uploadFile = selectedFile
      } else {
        const compressedBlob = await compressImage(selectedFile)
        uploadFile = new File(
          [compressedBlob],
          selectedFile.name.replace(/\.[^/.]+$/, '') + '.jpg',
          { type: 'image/jpeg' }
        )
      }

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('slug', businessSlug)
      formData.append('town', townSlug)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      setStep('success')

      // Auto-redirect after 10 seconds if user doesn't interact
      autoRedirectRef.current = setTimeout(() => {
        router.push(`/${townSlug}/${businessSlug}`)
      }, 10000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
      setStep('error')
    }
  }, [selectedFile, businessSlug, townSlug, router])

  const handleShare = useCallback(async () => {
    const shareUrl = `https://switchboard.town/${townSlug}/${businessSlug}?ref=share`
    const shareText = `I just updated the ${businessName} board on Switchboard — see what's posted in ${townName}!`

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl })
      } catch {
        // User cancelled share — not an error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        // Brief visual feedback handled by button state
      } catch {
        // Clipboard API not available — ignore
      }
    }
  }, [townSlug, businessSlug, businessName, townName])

  const handleSave = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sb-saved-boards') || '[]') as string[]
      const key = `${townSlug}/${businessSlug}`
      if (!saved.includes(key)) {
        saved.push(key)
        localStorage.setItem('sb-saved-boards', JSON.stringify(saved))
      }
    } catch {
      // localStorage not available — ignore
    }
  }, [townSlug, businessSlug])

  const handleViewBoard = useCallback(() => {
    if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current)
    router.push(`/${townSlug}/${businessSlug}`)
  }, [router, townSlug, businessSlug])

  // Hidden file input — shared across all steps
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,.heic,.HEIC,.heif,.HEIF"
      capture="environment"
      onChange={handleFileSelected}
      className="hidden"
    />
  )

  /* ── TIPS SCREEN ────────────────────────────────────────── */
  if (step === 'tips') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--sb-warm-white)' }}
      >
        {fileInput}
        <div className="max-w-[480px] mx-auto w-full px-4 py-8 flex-1 flex flex-col">
          {/* Back link */}
          <a
            href={`/${townSlug}/${businessSlug}`}
            className="inline-flex items-center gap-1.5 text-sm no-underline mb-6"
            style={{ color: 'var(--sb-stone)' }}
          >
            <ArrowLeft size={14} />
            Back to {businessName}
          </a>

          {/* Business context */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            Update {businessName}
          </h1>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
          >
            {getFreshnessMessage(lastUpdated)}
          </p>

          {/* Photo tips */}
          <div
            className="p-5 mb-6"
            style={{
              background: 'var(--sb-white)',
              border: '1px solid var(--sb-warm-gray)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Quick tips for a great photo
            </p>
            <ul className="space-y-2.5">
              {TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--sb-slate)', fontWeight: 300 }}
                >
                  <CheckCircle
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--sb-green)' }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Good / Bad comparison */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: 'var(--sb-radius)' }}
            >
              <Image
                src="/instructional/tip-1.webp"
                alt="Bad example: too close to the board"
                width={240}
                height={180}
                className="w-full h-auto"
                style={{ aspectRatio: '4/3', objectFit: 'cover' }}
              />
              <span
                className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1"
                style={{
                  background: 'var(--sb-red)',
                  color: '#fff',
                  borderRadius: '4px',
                }}
              >
                <X size={12} strokeWidth={3} />
                Too close
              </span>
            </div>
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: 'var(--sb-radius)' }}
            >
              <Image
                src="/instructional/tip-2.webp"
                alt="Good example: full board visible"
                width={240}
                height={180}
                className="w-full h-auto"
                style={{ aspectRatio: '4/3', objectFit: 'cover' }}
              />
              <span
                className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1"
                style={{
                  background: 'var(--sb-green)',
                  color: '#fff',
                  borderRadius: '4px',
                }}
              >
                <CheckCircle size={12} strokeWidth={3} />
                Good
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mt-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 w-full font-bold no-underline transition-colors duration-200 active:brightness-90"
              style={{
                background: 'var(--sb-amber)',
                color: 'var(--sb-charcoal)',
                borderRadius: 'var(--sb-radius)',
                height: '56px',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Camera size={22} strokeWidth={2.5} />
              Open Camera
            </button>
            <p
              className="text-xs text-center mt-4"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              Your photo will be public on Switchboard
            </p>
          </div>
        </div>
      </main>
    )
  }

  /* ── PREVIEW SCREEN ─────────────────────────────────────── */
  if (step === 'preview') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--sb-warm-white)' }}
      >
        {fileInput}
        <div className="max-w-[480px] mx-auto w-full px-4 py-8 flex-1 flex flex-col">
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            {businessName}
          </h2>
          <p
            className="text-sm mb-5"
            style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
          >
            Review your photo before uploading
          </p>

          {/* Photo preview */}
          {previewUrl && (
            <div
              className="mb-6 overflow-hidden"
              style={{
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Photo preview"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleRetake}
              className="flex-1 flex items-center justify-center gap-2 font-semibold transition-colors duration-200"
              style={{
                background: 'transparent',
                color: 'var(--sb-slate)',
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
                height: '52px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Retake
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 flex items-center justify-center gap-2 font-bold transition-colors duration-200 active:brightness-90"
              style={{
                background: 'var(--sb-amber)',
                color: 'var(--sb-charcoal)',
                border: 'none',
                borderRadius: 'var(--sb-radius)',
                height: '52px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Upload
            </button>
          </div>
        </div>
      </main>
    )
  }

  /* ── UPLOADING SCREEN ───────────────────────────────────── */
  if (step === 'uploading') {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--sb-warm-white)' }}
      >
        <div className="text-center px-4">
          <Loader2
            size={40}
            className="animate-spin mx-auto mb-4"
            style={{ color: 'var(--sb-amber)' }}
          />
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            Uploading...
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
          >
            Updating {businessName}
          </p>
        </div>
      </main>
    )
  }

  /* ── SUCCESS SCREEN (Share & Save) ──────────────────────── */
  if (step === 'success') {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--sb-warm-white)' }}
      >
        <div className="max-w-[480px] mx-auto w-full px-4 py-8 flex-1 flex flex-col">
          {/* Confirmation */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: 'var(--sb-green)', color: '#fff' }}
            >
              <CheckCircle size={28} />
            </div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Posted to {businessName}
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
            >
              The board is now up to date. Thank you!
            </p>
          </div>

          {/* Photo preview */}
          {previewUrl && (
            <div
              className="mb-8 overflow-hidden"
              style={{
                border: '1px solid var(--sb-warm-gray)',
                borderRadius: 'var(--sb-radius)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${businessName} bulletin board`}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Share & Save */}
          <div className="space-y-3 mb-6">
            <ShareButton onShare={handleShare} />
            <SaveButton
              onSave={handleSave}
              businessName={businessName}
            />
          </div>

          {/* View board link */}
          <div className="mt-auto text-center">
            <button
              onClick={handleViewBoard}
              className="inline-flex items-center gap-2 font-semibold text-base no-underline"
              style={{
                color: 'var(--sb-amber)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              View the board &rarr;
            </button>
          </div>
        </div>
      </main>
    )
  }

  /* ── ERROR SCREEN ───────────────────────────────────────── */
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--sb-warm-white)' }}
    >
      <div className="max-w-xs w-full text-center px-4">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{ background: 'var(--sb-red)', color: '#fff' }}
        >
          <X size={28} />
        </div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          Upload failed
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
        >
          {error || 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={handleRetake}
          className="flex items-center justify-center gap-2 w-full font-bold transition-colors duration-200 active:brightness-90"
          style={{
            background: 'var(--sb-amber)',
            color: 'var(--sb-charcoal)',
            border: 'none',
            borderRadius: 'var(--sb-radius)',
            height: '52px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href={`/${townSlug}/${businessSlug}`}
          className="inline-block mt-4 text-sm no-underline"
          style={{ color: 'var(--sb-stone)', minHeight: '44px', lineHeight: '44px' }}
        >
          Back to {businessName}
        </a>
      </div>
    </main>
  )
}

/* ── Sub-components ───────────────────────────────────────── */

function ShareButton({ onShare }: { onShare: () => void }) {
  const [shared, setShared] = useState(false)

  const handleClick = async () => {
    await onShare()
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-3 w-full font-semibold transition-colors duration-200 active:brightness-90"
      style={{
        background: 'var(--sb-amber)',
        color: 'var(--sb-charcoal)',
        border: 'none',
        borderRadius: 'var(--sb-radius)',
        height: '52px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
    >
      <Share2 size={18} />
      {shared ? 'Shared!' : 'Share with friends'}
    </button>
  )
}

function SaveButton({
  onSave,
  businessName,
}: {
  onSave: () => void
  businessName: string
}) {
  const [saved, setSaved] = useState(false)

  const handleClick = () => {
    onSave()
    setSaved(true)
  }

  return (
    <button
      onClick={handleClick}
      disabled={saved}
      className="flex items-center justify-center gap-3 w-full font-semibold transition-colors duration-200"
      style={{
        background: 'transparent',
        color: saved ? 'var(--sb-green)' : 'var(--sb-slate)',
        border: `1px solid ${saved ? 'var(--sb-green)' : 'var(--sb-warm-gray)'}`,
        borderRadius: 'var(--sb-radius)',
        height: '52px',
        fontSize: '16px',
        cursor: saved ? 'default' : 'pointer',
      }}
    >
      <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
      {saved ? `${businessName} saved` : 'Save this board'}
    </button>
  )
}
