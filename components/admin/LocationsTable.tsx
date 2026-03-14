'use client'

import { useState } from 'react'
import type { Location, Town } from '@/types'
import PhotoHistory from './PhotoHistory'

interface LocationsTableProps {
  locations: Location[]
  towns: Town[]
  loading: boolean
  uploadingPhoto: string | null
  onEdit: (location: Location) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
  onRemove: (id: string, name: string) => void
  onGenerateQR: (location: Location) => void
  onUploadPhoto: (location: Location) => void
  onRefresh?: () => void
}

export default function LocationsTable({
  locations,
  towns,
  loading,
  uploadingPhoto,
  onEdit,
  onToggleActive,
  onRemove,
  onGenerateQR,
  onUploadPhoto,
  onRefresh
}: LocationsTableProps) {
  const [showPhotoHistory, setShowPhotoHistory] = useState<{ id: string; name: string } | null>(null)

  if (loading) {
    return (
      <div
        className="rounded-lg"
        style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
      >
        <div className="p-8 text-center" style={{ color: 'var(--sb-stone)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
    >
      <div
        className="p-4"
        style={{ borderBottom: '1px solid var(--sb-warm-gray)' }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--sb-charcoal)' }}
        >
          All Locations ({locations.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--sb-warm-white)' }}>
              {['Name', 'Slug', 'Town', 'Address', 'Views', 'Status', 'Actions'].map((header) => (
                <th
                  key={header}
                  className="text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ padding: '12px 16px', color: 'var(--sb-slate)' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((location, index) => {
              const town = towns.find(t => t.id === location.town_id)
              const isOdd = index % 2 === 1
              return (
                <tr
                  key={location.id}
                  style={{
                    background: isOdd ? '#F8F5F0' : 'var(--sb-white)',
                    borderBottom: '1px solid var(--sb-warm-gray)',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF3C7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = isOdd ? '#F8F5F0' : 'var(--sb-white)'}
                >
                  <td
                    className="text-sm font-medium"
                    style={{ padding: '12px 16px', color: 'var(--sb-charcoal)' }}
                  >
                    {location.name}
                  </td>
                  <td
                    className="text-sm font-mono"
                    style={{ padding: '12px 16px', color: 'var(--sb-stone)' }}
                  >
                    {location.slug}
                  </td>
                  <td
                    className="text-sm"
                    style={{ padding: '12px 16px', color: 'var(--sb-stone)' }}
                  >
                    {town?.name || location.town || 'Unknown'}
                  </td>
                  <td
                    className="text-sm"
                    style={{ padding: '12px 16px', color: 'var(--sb-stone)' }}
                  >
                    {location.address || '-'}
                  </td>
                  <td
                    className="text-sm"
                    style={{ padding: '12px 16px', color: 'var(--sb-stone)' }}
                  >
                    {location.view_count}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => onToggleActive(location.id, location.is_active)}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: location.is_active ? '#DCFCE7' : '#FEE2E2',
                        color: location.is_active ? '#166534' : '#991B1B',
                      }}
                    >
                      {location.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onEdit(location)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--sb-amber)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onGenerateQR(location)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--sb-green)' }}
                      >
                        QR
                      </button>
                      <button
                        onClick={() => onUploadPhoto(location)}
                        disabled={uploadingPhoto === location.slug}
                        className="text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: 'var(--sb-slate)' }}
                      >
                        {uploadingPhoto === location.slug ? 'Uploading...' : 'Photo'}
                      </button>
                      <button
                        onClick={() => setShowPhotoHistory({ id: location.id, name: location.name })}
                        className="text-xs font-medium"
                        style={{ color: 'var(--sb-stone)' }}
                      >
                        History
                      </button>
                      <button
                        onClick={() => onRemove(location.id, location.name)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--sb-red)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Photo History Modal */}
      {showPhotoHistory && (
        <PhotoHistory
          locationId={showPhotoHistory.id}
          locationName={showPhotoHistory.name}
          onClose={() => setShowPhotoHistory(null)}
          onRevert={() => {
            if (onRefresh) {
              onRefresh()
            }
          }}
        />
      )}
    </div>
  )
}
