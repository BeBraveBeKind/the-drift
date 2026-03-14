'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import QRCode from 'qrcode'
import TownsList from './TownsList'
import LocationForm from './LocationForm'
import LocationsTable from './LocationsTable'
import AutoFlaggedReview from './AutoFlaggedReview'
import AnalyticsPanel from './AnalyticsPanel'
import type { Location, LocationFormData, Town } from '@/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTownsSection, setShowTownsSection] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [autoFlaggedCount, setAutoFlaggedCount] = useState(0)
  const [showAutoFlagged, setShowAutoFlagged] = useState(false)
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
    checkAutoFlagged()
  }, [])

  const loadData = async () => {
    await Promise.all([loadLocations(), loadTowns()])
  }

  const checkAutoFlagged = async () => {
    try {
      const response = await fetch('/api/admin/auto-flagged')
      if (response.ok) {
        const data = await response.json()
        setAutoFlaggedCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error checking auto-flagged photos:', error)
    }
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
        
        // Compress image if it's too large (especially for mobile)
        let uploadFile = file
        const MAX_SIZE = 5 * 1024 * 1024 // 5MB
        
        if (file.size > MAX_SIZE && file.type.startsWith('image/')) {
          try {
            // Create a canvas to compress the image
            const img = new Image()
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = URL.createObjectURL(file)
            })
            
            // Calculate new dimensions (max 2048px on longest side)
            let { width, height } = img
            const maxDimension = 2048
            
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension
                width = maxDimension
              } else {
                width = (width / height) * maxDimension
                height = maxDimension
              }
            }
            
            canvas.width = width
            canvas.height = height
            ctx?.drawImage(img, 0, 0, width, height)
            
            // Convert to blob with compression
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob(
                (b) => resolve(b || file),
                'image/jpeg',
                0.85 // 85% quality
              )
            })
            
            uploadFile = new File([blob], file.name, { type: 'image/jpeg' })
            console.log(`Compressed image from ${file.size} to ${uploadFile.size} bytes`)
            
            URL.revokeObjectURL(img.src)
          } catch (compressionError) {
            console.warn('Image compression failed, using original:', compressionError)
          }
        }
        
        const formData = new FormData()
        formData.append('file', uploadFile)
        formData.append('slug', location.slug)
        formData.append('town', townSlug)
        
        // Increase timeout for mobile uploads (3 minutes)
        const controller = new AbortController()
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const timeoutMs = isMobile ? 180000 : 120000 // 3 min for mobile, 2 min for desktop
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        
        const response = await fetch('/api/upload-fast', {
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
            errorMessage = 'Upload timed out. This can happen with large files or slow connections.'
          } else if (error.message.includes('fetch')) {
            errorMessage = 'Network error - please check your internet connection'
          } else {
            errorMessage = error.message
          }
        }
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const tips = isMobile 
          ? `Upload failed: ${errorMessage}\n\nTips for mobile uploads:\n1. Use WiFi instead of cellular data if possible\n2. Take photos in lower resolution if available\n3. Close other apps to free up memory\n4. Try uploading one photo at a time`
          : `Upload failed: ${errorMessage}\n\nPlease try:\n1. Check your internet connection\n2. Ensure the file is an image\n3. Try a smaller image file\n4. Refresh the page and try again`
        
        alert(tips)
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
    <main className="min-h-screen" style={{ background: 'var(--sb-warm-white)' }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--sb-charcoal)' }}
          >
            Admin Dashboard
          </h1>

          <div className="flex gap-3 flex-wrap justify-end">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{ background: 'var(--sb-slate)', color: '#fff' }}
            >
              View Site ↗
            </a>
            {autoFlaggedCount > 0 && (
              <button
                onClick={() => setShowAutoFlagged(true)}
                className="px-4 py-2 rounded-md font-semibold text-sm transition-colors relative"
                style={{ background: '#EA580C', color: '#fff' }}
              >
                Review Flagged
                <span
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--sb-red)', color: '#fff' }}
                >
                  {autoFlaggedCount}
                </span>
              </button>
            )}
            <a
              href="/admin/signs"
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{ background: '#7C3AED', color: '#fff' }}
            >
              Signs
            </a>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{ background: '#0EA5E9', color: '#fff' }}
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            <button
              onClick={() => setShowTownsSection(!showTownsSection)}
              className="btn-primary text-sm"
              style={{ padding: '8px 16px' }}
            >
              {showTownsSection ? 'Hide' : 'Manage'} Towns
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{ background: 'var(--sb-green)', color: '#fff' }}
            >
              Add Location
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{ background: 'var(--sb-red)', color: '#fff' }}
            >
              Logout
            </button>
          </div>
        </div>

        {showAnalytics && <AnalyticsPanel />}

        {showTownsSection && (
          <div className="mb-8">
            <div
              className="p-6 rounded-lg"
              style={{ background: 'var(--sb-white)', border: '1px solid var(--sb-warm-gray)' }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--sb-charcoal)' }}
              >
                Towns Management
              </h2>
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
          onRefresh={loadLocations}
        />

        {/* Auto-Flagged Review Modal */}
        {showAutoFlagged && (
          <AutoFlaggedReview
            onClose={() => setShowAutoFlagged(false)}
            onReviewed={() => {
              setShowAutoFlagged(false)
              checkAutoFlagged()
              loadLocations()
            }}
          />
        )}
      </div>
    </main>
  )
}