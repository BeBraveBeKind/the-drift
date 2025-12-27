import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import { notFound } from 'next/navigation'
import ShareButton from '@/components/ShareButton'
import FlagButton from '@/components/FlagButton'
import ViewTracker from '@/components/ViewTracker'

export const revalidate = 60

async function getBoard(slug: string) {
  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (!location) return null
  
  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('location_id', location.id)
    .eq('is_current', true)
    .eq('is_flagged', false)
    .single()
  
  return { location, photo }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getBoard(slug)
  
  if (!data) notFound()
  
  const { location, photo } = data
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <ViewTracker locationId={location.id} />
      
      <nav className="mb-6">
        <a href="/" className="text-sm text-stone-400 hover:text-stone-600">
          ← The Drift
        </a>
      </nav>
      
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{location.name}</h1>
        {location.address && (
          <p className="text-stone-500 text-sm mt-1">{location.address}</p>
        )}
      </header>
      
      {photo ? (
        <div>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={getPhotoUrl(photo.storage_path)}
              alt={`${location.name} bulletin board`}
              className="w-full"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-stone-400">
              Updated {timeAgo(photo.created_at)} · {location.view_count} looks
            </span>
            <div className="flex items-center gap-4">
              <ShareButton slug={location.slug} name={location.name} />
              <FlagButton photoId={photo.id} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-100 rounded-lg p-12 text-center">
          <p className="text-stone-400">No photo yet</p>
          <p className="text-sm text-stone-300 mt-1">
            Be the first to share what's posted
          </p>
        </div>
      )}
    </main>
  )
}