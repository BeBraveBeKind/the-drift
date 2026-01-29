'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  storage_path: string
  is_current: boolean
  is_flagged: boolean
  flag_reason: string | null
  uploaded_at: string
  uploaded_by: string | null
  photo_url: string
}

interface PhotoHistoryProps {
  locationId: string
  locationName: string
  onClose: () => void
  onRevert: () => void
}

export default function PhotoHistory({ locationId, locationName, onClose, onRevert }: PhotoHistoryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [reverting, setReverting] = useState<string | null>(null)
  const [flagReason, setFlagReason] = useState('')
  const [showReasonDialog, setShowReasonDialog] = useState<string | null>(null)

  useEffect(() => {
    loadPhotoHistory()
  }, [locationId])

  const loadPhotoHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/photos/history?location_id=${locationId}`)
      const data = await response.json()
      
      if (response.ok) {
        setPhotos(data.photos || [])
      } else {
        console.error('Failed to load photo history:', data.error)
        alert(`Failed to load photo history: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading photo history:', error)
      alert('Failed to load photo history')
    } finally {
      setLoading(false)
    }
  }

  const handleRevert = async (photoId: string, withReason: boolean = false) => {
    const reason = withReason ? flagReason : null
    
    setReverting(photoId)
    setShowReasonDialog(null)
    setFlagReason('')
    
    try {
      const response = await fetch('/api/photos/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: locationId,
          photo_id: photoId,
          reason
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        await loadPhotoHistory()
        onRevert()
        alert('Photo reverted successfully')
      } else {
        alert(`Failed to revert photo: ${data.error}`)
      }
    } catch (error) {
      console.error('Error reverting photo:', error)
      alert('Failed to revert photo')
    } finally {
      setReverting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#2C2C2C]">Photo History</h2>
              <p className="text-sm text-gray-600 mt-1">{locationName}</p>
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
            <div className="text-center py-8">Loading photo history...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No photos found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`border rounded-lg overflow-hidden ${
                    photo.is_current ? 'ring-2 ring-green-500' : ''
                  } ${photo.is_flagged ? 'opacity-75' : ''}`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={photo.photo_url}
                      alt="Photo version"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {photo.is_current && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        CURRENT
                      </div>
                    )}
                    {photo.is_flagged && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        FLAGGED
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="text-sm text-gray-600 mb-2">
                      {formatDate(photo.uploaded_at)}
                    </div>
                    
                    {photo.uploaded_by && (
                      <div className="text-xs text-gray-500 mb-2">
                        Uploaded by: {photo.uploaded_by}
                      </div>
                    )}
                    
                    {photo.flag_reason && (
                      <div className="text-xs text-red-600 mb-2">
                        Reason: {photo.flag_reason}
                      </div>
                    )}

                    {/* Actions */}
                    {!photo.is_current && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRevert(photo.id)}
                          disabled={reverting === photo.id}
                          className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {reverting === photo.id ? 'Reverting...' : 'Revert'}
                        </button>
                        <button
                          onClick={() => setShowReasonDialog(photo.id)}
                          disabled={reverting === photo.id}
                          className="flex-1 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Flag & Revert
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reason Dialog */}
        {showReasonDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Flag Current Photo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide a reason for flagging the current photo (e.g., inappropriate content, wrong business, etc.)
              </p>
              <input
                type="text"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border rounded px-3 py-2 mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReasonDialog(null)
                    setFlagReason('')
                  }}
                  className="flex-1 border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevert(showReasonDialog, true)}
                  disabled={!flagReason.trim()}
                  className="flex-1 bg-orange-500 text-white rounded px-4 py-2 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Flag & Revert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}