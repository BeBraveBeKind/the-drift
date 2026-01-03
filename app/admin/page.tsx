'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

// Random rotation for elements
function getRandomRotation() {
  return Math.random() * 6 - 3 // -3 to +3 degrees
}

const pushpinColors = [
  '#D94F4F', // Pushpin Red
  '#F4D03F', // Pushpin Yellow  
  '#5B9BD5', // Pushpin Blue
  '#6BBF59'  // Pushpin Green
]

function getRandomPushpinColor() {
  return pushpinColors[Math.floor(Math.random() * pushpinColors.length)]
}

interface Location {
  id: string
  name: string
  slug: string
  town: string
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
  town: string
  address: string
  description: string
}

function AdminAuth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check password on client side - simple protection
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      localStorage.setItem('admin_auth', 'true')
      onAuthenticated()
    } else {
      setError('Invalid password')
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#C4A574]" />
  }

  return (
    <main className="min-h-screen bg-[#C4A574] relative flex items-center justify-center">
      {/* Cork Board Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        <div className="relative inline-block">
          <div 
            className="bg-[#FFFEF9] p-8 shadow-lg border-[1px] border-[#E5E5E5] relative max-w-md"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              borderRadius: '2px'
            }}
          >
            <h1 className="text-[24px] font-bold text-[#2C2C2C] mb-6 text-center">
              Admin Access
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#2C2C2C] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="text-[#D94F4F] text-[12px] text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#D94F4F] text-white p-3 rounded-md font-semibold text-[14px] hover:bg-[#c44545] transition-colors"
              >
                Enter Admin
              </button>
            </form>

            {/* Pushpin */}
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
      </div>
    </main>
  )
}

function AdminDashboard() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [form, setForm] = useState<LocationForm>({
    name: '',
    slug: '',
    town: 'viroqua',
    address: '',
    description: ''
  })

  useEffect(() => {
    setMounted(true)
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })
    
    setLocations(data || [])
    setLoading(false)
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
    } else {
      console.error('Toggle failed:', error)
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
      console.error('Remove failed:', error)
      alert(`Failed to remove location: ${error.message || 'Unknown error'}`)
    }
  }

  const saveLocation = async () => {
    if (!form.name.trim() || !form.slug.trim()) return

    if (editingId) {
      const { error } = await supabase.rpc('admin_update_location', {
        p_id: editingId,
        p_name: form.name,
        p_slug: form.slug,
        p_town: form.town,
        p_address: form.address || null,
        p_description: form.description || null
      })
      
      if (!error) {
        setEditingId(null)
        loadLocations()
        setForm({ name: '', slug: '', town: 'viroqua', address: '', description: '' })
      } else {
        console.error('Update failed:', error)
        alert(`Failed to update location: ${error.message || 'Unknown error'}`)
      }
    } else {
      const { error } = await supabase.rpc('admin_create_location', {
        p_name: form.name,
        p_slug: form.slug,
        p_town: form.town,
        p_address: form.address || null,
        p_description: form.description || null
      })
      
      if (!error) {
        setShowAddForm(false)
        loadLocations()
        setForm({ name: '', slug: '', town: 'viroqua', address: '', description: '' })
      } else {
        console.error('Create failed:', error)
        alert(`Failed to add location: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const startEdit = (location: Location) => {
    setForm({
      name: location.name,
      slug: location.slug,
      town: location.town || 'viroqua',
      address: location.address || '',
      description: location.description || ''
    })
    setEditingId(location.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setForm({ name: '', slug: '', town: 'viroqua', address: '', description: '' })
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
      
      // Create download link
      const link = document.createElement('a')
      link.download = `qr-${location.slug}.png`
      link.href = qrDataUrl
      link.click()
    } catch (error) {
      console.error('QR generation failed:', error)
    }
  }

  const uploadPhoto = async (slug: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploadingPhoto(slug)
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slug', slug)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          alert('Photo uploaded successfully!')
          // Optionally reload locations to see updated timestamps
          loadLocations()
        } else {
          const error = await response.text()
          alert(`Upload failed: ${error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Upload failed: Network error')
      } finally {
        setUploadingPhoto(null)
      }
    }
    input.click()
  }

  const logout = () => {
    localStorage.removeItem('admin_auth')
    window.location.reload()
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#C4A574]" />
  }

  return (
    <main className="min-h-screen bg-[#C4A574] relative">
      {/* Cork Board Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
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
              
              {/* Pushpin */}
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
              onClick={() => setShowAddForm(true)}
              className="bg-[#6BBF59] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#5da850] transition-colors"
            >
              Add Location
            </button>
            <button
              onClick={logout}
              className="bg-[#D94F4F] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#c44545] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
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
                    value={form.town}
                    onChange={(e) => setForm(prev => ({ ...prev, town: e.target.value }))}
                    className="w-full p-3 border border-[#E5E5E5] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D94F4F]"
                  >
                    <option value="viroqua">Viroqua</option>
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
                    placeholder="123 Main St, Viroqua, WI"
                  />
                </div>
                
                <div>
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

              {/* How to Post Reminder */}
              {!editingId && (
                <div className="mt-4 p-3 bg-[#F4D03F] bg-opacity-20 border border-[#F4D03F] border-opacity-30 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-[16px]">💡</span>
                    <div className="text-[13px] text-[#2C2C2C]">
                      <p className="font-medium mb-1">Reminder: Each location automatically includes a "How to Post" link</p>
                      <p>Users will see instructions on using QR codes and photo guidelines. After adding this location, generate its QR code below.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveLocation}
                  disabled={!form.name.trim() || !form.slug.trim()}
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

        {/* Locations Table */}
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
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[14px] text-[#2C2C2C] font-medium">
                        {location.name}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-[#6B6B6B] font-mono">
                        {location.slug}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-[#6B6B6B]">
                        {location.town || 'viroqua'}
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
                            onClick={() => uploadPhoto(location.slug)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const authStatus = localStorage.getItem('admin_auth')
    setIsAuthenticated(authStatus === 'true')
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-[#C4A574]" />
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return <AdminDashboard />
}