'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AutoFlaggedEvent {
  event_id: string
  photo_id: string
  location_id: string
  location_name: string
  location_slug: string
  town: string
  flag_count: number
  auto_flagged_at: string
  storage_path: string
  photo_url: string
}

interface AutoFlaggedReviewProps {
  onClose: () => void
  onReviewed: () => void
}

export default function AutoFlaggedReview({ onClose, onReviewed }: AutoFlaggedReviewProps) {
  const [events, setEvents] = useState<AutoFlaggedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadAutoFlagged()
  }, [])

  const loadAutoFlagged = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/auto-flagged')
      const data = await response.json()
      
      if (response.ok) {
        setEvents(data.events || [])
      } else {
        console.error('Failed to load auto-flagged photos:', data.error)
        alert('Failed to load auto-flagged photos')
      }
    } catch (error) {
      console.error('Error loading auto-flagged photos:', error)
      alert('Failed to load auto-flagged photos')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (eventId: string, action: string, locationId: string, photoId: string) => {
    setProcessing(eventId)
    
    try {
      // First, mark the event as reviewed
      const reviewResponse = await fetch('/api/admin/auto-flagged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          action
        })
      })
      
      if (!reviewResponse.ok) {
        throw new Error('Failed to mark as reviewed')
      }

      // If approving (keeping flagged), we don't need to do anything else
      // If reverting, we need to unflag the photo or revert to previous
      if (action === 'revert') {
        // Get photo history and revert to previous
        const historyResponse = await fetch(`/api/photos/history?location_id=${locationId}`)
        const historyData = await historyResponse.json()
        
        if (historyResponse.ok && historyData.photos?.length > 1) {
          // Find the previous unflagged photo
          const previousPhoto = historyData.photos.find((p: any) => 
            p.id !== photoId && !p.is_flagged
          )
          
          if (previousPhoto) {
            // Revert to the previous photo
            await fetch('/api/photos/revert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location_id: locationId,
                photo_id: previousPhoto.id,
                reason: `Reverted due to community flags (${events.find(e => e.event_id === eventId)?.flag_count} reports)`
              })
            })
          }
        }
      }

      // Remove from list
      setEvents(prev => prev.filter(e => e.event_id !== eventId))
      
      // If no more events, close and refresh parent
      if (events.length === 1) {
        onReviewed()
        onClose()
      }
    } catch (error) {
      console.error('Error processing action:', error)
      alert('Failed to process action')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#2C2C2C]">Review Auto-Flagged Photos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Photos automatically flagged after receiving 3+ community reports
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">Loading flagged photos...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No photos need review!</div>
              <div className="text-sm text-gray-400">
                Photos with 3+ community flags will appear here for review
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.event_id}
                  className="border rounded-lg overflow-hidden bg-gray-50"
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Photo */}
                      <div className="relative w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.photo_url}
                          alt="Flagged photo"
                          fill
                          className="object-cover"
                          sizes="192px"
                        />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {event.flag_count} FLAGS
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg text-[#2C2C2C]">
                            {event.location_name}
                          </h3>
                          <div className="text-sm text-gray-600">
                            {event.town} • {event.location_slug}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Auto-flagged {formatDate(event.auto_flagged_at)}
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                          <div className="text-sm font-medium text-yellow-800 mb-1">
                            Community Reports: {event.flag_count}
                          </div>
                          <div className="text-xs text-yellow-700">
                            This photo was automatically hidden after receiving multiple community flags.
                            Review and decide if it should remain flagged or be reverted to a previous photo.
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(event.event_id, 'approved', event.location_id, event.photo_id)}
                            disabled={processing === event.event_id}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {processing === event.event_id ? 'Processing...' : 'Keep Flagged'}
                          </button>
                          <button
                            onClick={() => handleAction(event.event_id, 'revert', event.location_id, event.photo_id)}
                            disabled={processing === event.event_id}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {processing === event.event_id ? 'Processing...' : 'Revert to Previous'}
                          </button>
                          <a
                            href={`/post/${event.town}/${event.location_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 text-center"
                          >
                            View Location ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {events.length > 0 && !loading && (
          <div className="border-t p-4 bg-gray-50">
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> The flag threshold is currently set to 3 reports.
              Photos are automatically hidden when they reach this threshold.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}