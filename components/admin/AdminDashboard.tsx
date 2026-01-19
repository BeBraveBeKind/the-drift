'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import QRCode from 'qrcode'
import TownsList from './TownsList'

function getRandomRotation() {
  return Math.random() * 6 - 3
}

const pushpinColors = [
  '#D94F4F',
  '#F4D03F',
  '#5B9BD5',
  '#6BBF59'
]

function getRandomPushpinColor() {
  return pushpinColors[Math.floor(Math.random() * pushpinColors.length)]
}

interface Location {
  id: string
  name: string
  slug: string
  town: string
  town_id: string
  address: string | null
  description: string | null
  view_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LocationForm {
  name: string
  slug: string
  town_id: string
  address: string
  description: string
}

interface Town {
  id: string
  name: string
  slug: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTownsSection, setShowTownsSection] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [form, setForm] = useState<LocationForm>({
    name: '',
    slug: '',
    town_id: '',
    address: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([loadLocations(), loadTowns()])
  }

  const loadLocations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('locations')
      .select(`
        *,
        towns!locations_town_id_fkey (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
    
    const transformedData = data?.map(loc => ({
      ...loc,
      town: loc.towns?.slug || 'viroqua',
      town_id: loc.town_id || loc.towns?.id
    })) || []
    
    setLocations(transformedData)
    setLoading(false)
  }

  const loadTowns = async () => {
    const { data } = await supabase
      .from('towns')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setTowns(data || [])
    
    if (data && data.length > 0 && !form.town_id) {
      setForm(prev => ({ ...prev, town_id: data[0].id }))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name)
    }))
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.rpc('admin_toggle_location_active', {
      p_id: id,
      p_is_active: !currentStatus
    })
    
    if (!error) {
      loadLocations()
    }
  }

  const removeLocation = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This will also delete all photos for this location.`)) {
      return
    }

    const { error } = await supabase.rpc('admin_remove_location', {
      p_id: id
    })
    
    if (!error) {
      loadLocations()
      alert(`Location "${name}" has been removed successfully.`)
    } else {
      alert(`Failed to remove location: ${error.message || 'Unknown error'}`)
    }
  }

  const saveLocation = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.town_id) return

    const selectedTown = towns.find(t => t.id === form.town_id)
    if (!selectedTown) return

    if (editingId) {
      const { error } = await supabase.rpc('admin_update_location', {
        p_id: editingId,
        p_name: form.name,
        p_slug: form.slug,
        p_town: selectedTown.slug,
        p_address: form.address || null,
        p_description: form.description || null
      })
      
      if (!error) {
        setEditingId(null)
        loadLocations()
        resetForm()
      } else {
        alert(`Failed to update location: ${error.message || 'Unknown error'}`)
      }
    } else {
      const { error } = await supabase
        .from('locations')
        .insert([{
          name: form.name,
          slug: form.slug,
          town: selectedTown.slug,
          town_id: form.town_id,
          address: form.address || null,
          description: form.description || null,
          is_active: true
        }])
      
      if (!error) {
        setShowAddForm(false)
        loadLocations()
        resetForm()
      } else {
        alert(`Failed to add location: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      town_id: towns[0]?.id || '',
      address: '',
      description: ''
    })
  }

  const startEdit = (location: Location) => {
    setForm({
      name: location.name,
      slug: location.slug,
      town_id: location.town_id,
      address: location.address || '',
      description: location.description || ''
    })
    setEditingId(location.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    resetForm()
  }

  const generateQRCode = async (location: Location) => {
    try {
      const url = `https://switchboard.town/post/${location.town}/${location.slug}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#2C2C2C',
          light: '#FFFFFF'
        }
      })
      
      const link = document.createElement('a')
      link.download = `qr-${location.slug}.png`
      link.href = qrDataUrl
      link.click()
    } catch (error) {
      console.error('QR generation failed:', error)
    }
  }

  const uploadPhoto = async (location: Location) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.heic,.HEIC,.heif,.HEIF'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploadingPhoto(location.slug)
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slug', location.slug)
        formData.append('town', location.town)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          alert('Photo uploaded successfully!')
          loadLocations()
        } else {
          const error = await response.text()
          alert(`Upload failed: ${error}`)
        }
      } catch (error) {
        alert('Upload failed: Network error')
      } finally {
        setUploadingPhoto(null)
      }
    }
    input.click()
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-[#C4A574] relative">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="relative inline-block">
            <div 
              className="bg-[#FFFEF9] p-4 shadow-lg border-[1px] border-[#E5E5E5] relative"
              style={{ 
                transform: `rotate(${getRandomRotation()}deg)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
              }}
            >
              <h1 className="text-[24px] font-bold text-[#2C2C2C]">Admin Dashboard</h1>
              
              <div 
                className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
                style={{ backgroundColor: getRandomPushpinColor() }}
              >
                <div 
                  className="w-3 h-3 rounded-full absolute top-1 left-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowTownsSection(!showTownsSection)}
              className="bg-[#F4D03F] text-[#2C2C2C] px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#e6c337] transition-colors"
            >
              {showTownsSection ? 'Hide' : 'Manage'} Towns
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#6BBF59] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#5da850] transition-colors"
            >
              Add Location
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#D94F4F] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#c44545] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {showTownsSection && (
          <div className="mb-8">
            <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
              <h2 className="text-[20px] font-bold text-[#2C2C2C] mb-4">Towns Management</h2>
              <TownsList onTownsUpdated={loadTowns} />
            </div>
          </div>
        )}

        {(showAddForm || editingId) && (
          <div className="mb-8">
            <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
              <h2 className="text-[18px] font-semibold text-[#2C2C2C] mb-4">
                {editingId ? 'Edit Location' : 'Add New Location'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                    placeholder="Business name"
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                    placeholder="url-friendly-name"
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
                    Town *
                  </label>
                  <select
                    value={form.town_id}
                    onChange={(e) => setForm(prev => ({ ...prev, town_id: e.target.value }))}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                  >
                    {towns.map(town => (
                      <option key={town.id} value={town.id}>{town.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-medium text-[#2C2C2C] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveLocation}
                  disabled={!form.name.trim() || !form.slug.trim() || !form.town_id}
                  className="bg-[#6BBF59] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#5da850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? 'Update' : 'Add'} Location
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#FFFEF9] rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E5E5]">
            <h2 className="text-[18px] font-semibold text-[#2C2C2C]">
              All Locations ({locations.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#6B6B6B]">Loading...</div>
          ) : (
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
                            onClick={() => toggleActive(location.id, location.is_active)}
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
                              onClick={() => startEdit(location)}
                              className="text-[#5B9BD5] hover:text-[#4a8bc2] text-[12px] font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => generateQRCode(location)}
                              className="text-[#6BBF59] hover:text-[#5da850] text-[12px] font-medium"
                            >
                              QR Code
                            </button>
                            <button
                              onClick={() => uploadPhoto(location)}
                              disabled={uploadingPhoto === location.slug}
                              className="text-[#5B9BD5] hover:text-[#4a8bc2] text-[12px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {uploadingPhoto === location.slug ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            <button
                              onClick={() => removeLocation(location.id, location.name)}
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
          )}
        </div>
      </div>
    </main>
  )
}