import { supabase } from '@/lib/supabase'
import { getPhotoUrl, timeAgo } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from '@/components/ShareButton'
import FlagButton from '@/components/FlagButton'
import ViewTracker from '@/components/ViewTracker'
import BoardImage from '@/components/BoardImage'
import BusinessProfileDisplay from '@/components/BusinessProfileDisplay'

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
    .select('*, business_category, business_tags, profile_completed')
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
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <ViewTracker locationId={location.id} />
      
      {/* Cork board texture background pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link 
            href={`/${town}`} 
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 hover:shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {townName}
          </Link>
        </nav>
        
        {/* Business Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">{location.name}</h1>
            {location.address && (
              <p className="text-stone-500 text-sm mb-4">
                {location.address}
              </p>
            )}
            
            {/* Business Profile */}
            <BusinessProfileDisplay 
              businessCategory={location.business_category}
              businessTags={location.business_tags}
              className=""
            />
          </header>
        </div>
        
        {photo ? (
          <div>
            {/* Board Image with Frame */}
            <BoardImage
              src={getPhotoUrl(photo.storage_path)}
              alt={`${location.name} bulletin board`}
            />
            
            {/* Photo Metadata - Clean and Simple */}
            <div className="mt-8 space-y-6">
              {/* Stats Bar */}
              <div className="flex items-center justify-between text-sm text-stone-600">
                <div className="flex items-center gap-6">
                  <span>Updated {timeAgo(photo.created_at)}</span>
                  <span>{location.view_count.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShareButton town={town} slug={location.slug} name={location.name} />
                  <FlagButton photoId={photo.id} />
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-stone-200"></div>
            </div>
            
            {/* How to Post - Streamlined */}
            <div className="mt-8">
              <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">
                      Want to update this board?
                    </h3>
                    <p className="text-sm text-stone-600">
                      Visit this location and scan the QR code to post a fresh photo
                    </p>
                  </div>
                  <Link 
                    href="/how-to-post" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No Photo State - Enhanced
          <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-700 mb-2">No photo yet</h3>
              <p className="text-stone-500 mb-6">
                Be the first to share what's posted on this board
              </p>
              <Link 
                href="/how-to-post" 
                className="inline-flex items-center gap-2 bg-stone-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>📸</span>
                Learn How to Post
              </Link>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
          <p>The local news nobody's covering.</p>
        </footer>
      </div>
    </main>
  )
}