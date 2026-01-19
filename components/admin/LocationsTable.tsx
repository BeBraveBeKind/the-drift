'use client'

import type { Location, Town } from '@/types'

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
  onUploadPhoto
}: LocationsTableProps) {
  if (loading) {
    return (
      <div className="bg-[#FFFEF9] rounded-lg border border-[#E5E5E5] shadow-sm">
        <div className="p-8 text-center text-[#6B6B6B]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFEF9] rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5E5E5]">
        <h2 className="text-[18px] font-semibold text-[#2C2C2C]">
          All Locations ({locations.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Town
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Views
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#2C2C2C] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {locations.map((location) => {
              const town = towns.find(t => t.id === location.town_id)
              return (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[14px] text-[#2C2C2C] font-medium">
                    {location.name}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#6B6B6B] font-mono">
                    {location.slug}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#6B6B6B]">
                    {town?.name || location.town || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#6B6B6B]">
                    {location.address || '-'}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#6B6B6B]">
                    {location.view_count}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActive(location.id, location.is_active)}
                      className={`px-2 py-1 rounded-full text-[12px] font-medium ${
                        location.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {location.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(location)}
                        className="text-[#5B9BD5] hover:text-[#4a8bc2] text-[12px] font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onGenerateQR(location)}
                        className="text-[#6BBF59] hover:text-[#5da850] text-[12px] font-medium"
                      >
                        QR Code
                      </button>
                      <button
                        onClick={() => onUploadPhoto(location)}
                        disabled={uploadingPhoto === location.slug}
                        className="text-[#5B9BD5] hover:text-[#4a8bc2] text-[12px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPhoto === location.slug ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      <button
                        onClick={() => onRemove(location.id, location.name)}
                        className="text-[#D94F4F] hover:text-[#c44343] text-[12px] font-medium"
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
    </div>
  )
}