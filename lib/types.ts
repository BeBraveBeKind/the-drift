export interface Location {
  id: string
  name: string
  slug: string
  address: string | null
  description: string | null
  view_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  location_id: string
  storage_path: string
  is_current: boolean
  is_flagged: boolean
  flag_count: number
  created_at: string
}