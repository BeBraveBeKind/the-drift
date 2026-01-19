import { createClient } from '@/lib/supabase'
import { Town } from '@/lib/types'

export async function getTowns(onlyActive = true): Promise<Town[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('towns')
    .select('*')
    .order('name')
  
  if (onlyActive) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch towns: ${error.message}`)
  }
  
  return data || []
}

export async function getTownBySlug(slug: string): Promise<Town | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch town: ${error.message}`)
  }
  
  return data || null
}