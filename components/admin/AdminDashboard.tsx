'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import QRCode from 'qrcode'
import TownsList from './TownsList'
import LocationForm from './LocationForm'
import LocationsTable from './LocationsTable'
import type { Location, LocationFormData, Town } from '@/types'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTownsSection, setShowTownsSection] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [form, setForm] = useState<LocationFormData>({
    name: '',
    slug: '',
    town_id: '',
    address: '',
    description: '',
    business_category: '',
    business_tags: [],
    latitude: null,
    longitude: null
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
      town: loc.town || loc.towns?.slug || 'viroqua',
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


  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling active status:', { id, currentStatus, newStatus: !currentStatus })
      
      const { data, error } = await supabase.rpc('admin_toggle_location_active', {
        p_id: id,
        p_is_active: !currentStatus
      })
      
      console.log('Toggle response:', { data, error })
      
      if (error) {
        console.error('Toggle error:', error)
        alert(`Failed to toggle status: ${error.message}`)
        return
      }
      
      await loadLocations()
    } catch (err) {
      console.error('Unexpected error toggling status:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const removeLocation = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This will also delete all photos for this location.`)) {
      return
    }

    try {
      console.log('Attempting to remove location:', { id, name })
      
      const { data, error } = await supabase.rpc('admin_remove_location', {
        p_id: id
      })
      
      console.log('Remove location response:', { data, error })
      
      if (error) {
        console.error('Remove location error:', error)
        alert(`Failed to remove location: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`)
        return
      }
      
      await loadLocations()
      alert(`Location "${name}" has been removed successfully.`)
    } catch (err) {
      console.error('Unexpected error removing location:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const saveLocation = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.town_id) return

    const selectedTown = towns.find(t => t.id === form.town_id)
    if (!selectedTown) return

    if (editingId) {
      const { error: updateError } = await supabase.rpc('admin_update_location', {
        p_id: editingId,
        p_name: form.name,
        p_slug: form.slug,
        p_town: selectedTown.slug,
        p_address: form.address || null,
        p_description: form.description || null
      })
      
      // Also update coordinates and business profile fields separately since RPC might not handle them
      const { error: coordError } = await supabase
        .from('locations')
        .update({
          latitude: form.latitude,
          longitude: form.longitude,
          business_category: form.business_category || null,
          business_tags: form.business_tags || []
        })
        .eq('id', editingId)
      
      if (!updateError && !coordError) {
        setEditingId(null)
        loadLocations()
        resetForm()
      } else {
        alert(`Failed to update location: ${updateError?.message || coordError?.message || 'Unknown error'}`)
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
          business_category: form.business_category || null,
          business_tags: form.business_tags || [],
          latitude: form.latitude,
          longitude: form.longitude,
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
      description: '',
      business_category: '',
      business_tags: [],
      latitude: null,
      longitude: null
    })
  }

  const startEdit = (location: Location) => {
    setForm({
      name: location.name,
      slug: location.slug,
      town_id: location.town_id,
      address: location.address || '',
      description: location.description || '',
      business_category: location.business_category || '',
      business_tags: location.business_tags || [],
      latitude: location.latitude || null,
      longitude: location.longitude || null
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
        // Ensure we have a valid town value
        const townSlug = location.town || 'viroqua'
        
        console.log('Uploading photo for location:', {
          name: location.name,
          slug: location.slug,
          town: townSlug,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slug', location.slug)
        formData.append('town', townSlug)
        
        // Create timeout - increase to 60 seconds for large images
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        const responseText = await response.text()
        console.log('Upload response:', { status: response.status, text: responseText })
        
        if (response.ok) {
          alert('Photo uploaded successfully!')
          await loadLocations()
        } else {
          let errorMessage = responseText
          try {
            const errorJson = JSON.parse(responseText)
            errorMessage = errorJson.error || responseText
          } catch {}
          
          console.error('Upload failed:', errorMessage)
          alert(`Upload failed: ${errorMessage}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        let errorMessage = 'Network error'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Upload timed out - please check your connection and try again'
          } else if (error.message.includes('fetch')) {
            errorMessage = 'Network error - please check your internet connection'
          } else {
            errorMessage = error.message
          }
        }
        
        alert(`Upload failed: ${errorMessage}\n\nPlease try:\n1. Check your internet connection\n2. Ensure the file is an image\n3. Try a smaller image file\n4. Refresh the page and try again`)
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
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5B9BD5] text-white px-4 py-2 rounded-md font-semibold text-[14px] hover:bg-[#4a8bc2] transition-colors"
            >
              View Site ↗
            </a>
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
            <LocationForm
              form={form}
              towns={towns}
              isEditing={!!editingId}
              onFormChange={setForm}
              onSubmit={saveLocation}
              onCancel={cancelEdit}
            />
          </div>
        )}

        <LocationsTable
          locations={locations}
          towns={towns}
          loading={loading}
          uploadingPhoto={uploadingPhoto}
          onEdit={startEdit}
          onToggleActive={toggleActive}
          onRemove={removeLocation}
          onGenerateQR={generateQRCode}
          onUploadPhoto={uploadPhoto}
        />
      </div>
    </main>
  )
}