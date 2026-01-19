import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from '@/components/ShareButton'
import FlagButton from '@/components/FlagButton'
import ViewTracker from '@/components/ViewTracker'

export const revalidate = 60

// Format town name for display
function formatTownName(town: string) {
  return town.charAt(0).toUpperCase() + town.slice(1)
}

async function getBoard(townSlug: string, slug: string) {
  // First get the town by slug to get its ID
  const { data: townData } = await supabase
    .from('towns')
    .select('id, name')
    .eq('slug', townSlug)
    .eq('is_active', true)
    .single()
  
  if (!townData) return null
  
  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('town_id', townData.id)
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
  params: Promise<{ town: string; slug: string }>
}

export default async function BoardPage({ params }: PageProps) {
  const { town, slug } = await params
  const townName = formatTownName(town)
  const data = await getBoard(town, slug)
  
  if (!data) notFound()
  
  const { location, photo } = data
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <ViewTracker locationId={location.id} />
      
      <nav className="mb-6">
        <a href={`/${town}`} className="text-sm text-stone-400 hover:text-stone-600">
          ← Back to {townName}
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
            <div className="relative group">
              <Image 
                src={getPhotoUrl(photo.storage_path)}
                alt={`${location.name} bulletin board`}
                width={1200}
                height={900}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                className="w-full h-auto cursor-zoom-in"
                priority={true}
                onClick={() => window.open(getPhotoUrl(photo.storage_path), '_blank')}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none flex items-center justify-center">
                <div className="bg-white px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Click to zoom</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-stone-400">
              Updated {timeAgo(photo.created_at)} · {location.view_count} looks
            </span>
            <div className="flex items-center gap-4">
              <ShareButton town={town} slug={location.slug} name={location.name} />
              <FlagButton photoId={photo.id} />
            </div>
          </div>
          
          {/* How to Post Link */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700">
                  📸 Want to update this board?
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Use the QR code at this location to post a fresh photo
                </p>
              </div>
              <Link 
                href="/how-to-post" 
                className="text-xs bg-stone-600 text-white px-3 py-2 rounded hover:bg-stone-700 transition-colors"
              >
                How to Post
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-100 rounded-lg p-12 text-center">
          <p className="text-stone-400">No photo yet</p>
          <p className="text-sm text-stone-300 mt-1">
            Be the first to share what's posted
          </p>
          <div className="mt-6">
            <Link 
              href="/how-to-post" 
              className="inline-block bg-stone-600 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 transition-colors"
            >
              📸 How to Post
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}