import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import UploadFlow from '@/components/UploadFlow'

export const revalidate = 60

interface PageProps {
  params: Promise<{ town: string; slug: string }>
}

async function getBusinessContext(townSlug: string, slug: string) {
  const { data: townData } = await supabase
    .from('towns')
    .select('id, name')
    .eq('slug', townSlug)
    .single()

  if (!townData) return null

  const { data: location } = await supabase
    .from('locations')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('town_id', townData.id)
    .single()

  if (!location) return null

  const { data: photo } = await supabase
    .from('photos')
    .select('created_at')
    .eq('location_id', location.id)
    .eq('is_current', true)
    .eq('is_flagged', false)
    .single()

  return {
    businessName: location.name,
    townName: townData.name,
    lastUpdated: photo?.created_at,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { town, slug } = await params
  const ctx = await getBusinessContext(town, slug)
  if (!ctx) return { title: 'Not Found' }

  return {
    title: `Update ${ctx.businessName} — Switchboard`,
    description: `Take a photo of the ${ctx.businessName} bulletin board in ${ctx.townName}.`,
  }
}

export default async function PostPage({ params }: PageProps) {
  const { town, slug } = await params
  const ctx = await getBusinessContext(town, slug)

  if (!ctx) notFound()

  return (
    <UploadFlow
      townSlug={town}
      businessSlug={slug}
      businessName={ctx.businessName}
      townName={ctx.townName}
      lastUpdated={ctx.lastUpdated}
    />
  )
}
