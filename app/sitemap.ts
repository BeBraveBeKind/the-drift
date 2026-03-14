import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://switchboard.town'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-to-post`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/get-listed`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/towns`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Fetch all towns
  const { data: towns } = await supabase
    .from('towns')
    .select('slug')

  const townPages: MetadataRoute.Sitemap = (towns ?? []).map((town) => ({
    url: `${baseUrl}/${town.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Fetch all active locations with their town slugs
  const { data: locations } = await supabase
    .from('locations')
    .select('slug, towns!inner(slug)')
    .eq('is_active', true)

  const locationPages: MetadataRoute.Sitemap = (locations ?? []).map((location) => {
    const townSlug = (location.towns as unknown as { slug: string }).slug
    return {
      url: `${baseUrl}/${townSlug}/${location.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  })

  return [...staticPages, ...townPages, ...locationPages]
}
