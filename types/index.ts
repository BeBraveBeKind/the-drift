// Database entities
export interface Town {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
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
  // Business profile fields
  business_category?: string | null
  business_tags: string[]
  profile_completed: boolean
  profile_completed_at?: string | null
}

export interface Photo {
  id: string
  storage_path: string
  created_at: string
  is_current: boolean
  is_flagged: boolean
  location_id: string
}

// Composite types for UI
export interface LocationWithPhoto {
  id: string
  name: string
  slug: string
  address: string
  town: string
  town_id: string
  view_count: number
  updated_at: string
  // Business profile fields
  business_category?: string | null
  business_tags?: string[]
  profile_completed?: boolean
  photo: {
    id: string
    storage_path: string
    created_at: string
  } | null
}

// Form types
export interface LocationFormData {
  name: string
  slug: string
  town_id: string
  address: string
  description: string
  // Business profile fields
  business_category?: string
  business_tags: string[]
}

export interface TownFormData {
  name: string
  slug: string
  description: string
}

export interface BusinessProfileFormData {
  business_category: string
  business_tags: string[]
}

// Hook result types
export interface UseLocationsResult {
  locations: LocationWithPhoto[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

// Component prop types
export interface ImageViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export interface BoardImageProps {
  src: string
  alt: string
}

export interface PhotoUploaderProps {
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

// API response types
export interface UploadResponse {
  success: boolean
  message?: string
  photoId?: string
}