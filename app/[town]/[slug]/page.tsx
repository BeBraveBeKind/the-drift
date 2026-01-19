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
import Navigation from '@/components/Navigation'

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
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <ViewTracker locationId={location.id} />
        
        {/* Cork board texture background pattern */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-3xl mx-auto px-6 py-8 sm:py-12">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <Link 
              href={`/${town}`} 
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {townName}
            </Link>
          </nav>
          
          {/* Business Header */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="px-8 py-8">
              <h1 className="text-3xl font-bold text-stone-900 mb-2">{location.name}</h1>
              {location.address && (
                <p className="text-stone-500 text-base mb-6">
                  {location.address}
                </p>
              )}
              
              {/* Business Profile */}
              <BusinessProfileDisplay 
                businessCategory={location.business_category}
                businessTags={location.business_tags}
                className=""
              />
            </div>
          </div>
          
          {photo ? (
            <>
              {/* Board Image with Frame */}
              <BoardImage
                src={getPhotoUrl(photo.storage_path)}
                alt={`${location.name} bulletin board`}
              />
              
              {/* Photo Metadata */}
              <div className="mt-8 px-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-stone-600">
                  <div className="flex items-center gap-6">
                    <span>Updated {timeAgo(photo.created_at)}</span>
                    <span>{location.view_count.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShareButton town={town} slug={location.slug} name={location.name} />
                    <FlagButton photoId={photo.id} />
                  </div>
                </div>
              </div>
              
              {/* How to Post Section */}
              <div className="mt-12 bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-8 py-8">
                  <h3 className="font-bold text-lg text-stone-900 mb-3">
                    Want to update this board?
                  </h3>
                  <p className="text-stone-600 mb-6">
                    Visit {location.name} and scan the QR code on their bulletin board to post a fresh photo. 
                    It's free and takes less than 30 seconds.
                  </p>
                  <Link 
                    href="/how-to-post" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
                  >
                    Learn How to Post
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            // No Photo State
            <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 overflow-hidden">
              <div className="px-8 py-16 text-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-700 mb-3">No photo yet</h3>
                <p className="text-stone-500 mb-8 max-w-md mx-auto">
                  Be the first to share what's posted on this board. 
                  Visit the location and scan their QR code to upload a photo.
                </p>
                <Link 
                  href="/how-to-post" 
                  className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-900 transition-colors"
                >
                  <span>📸</span>
                  Learn How to Post
                </Link>
              </div>
            </div>
          )}
          
          {/* Get Listed CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
            <div className="px-8 py-8">
              <h3 className="font-bold text-lg text-blue-900 mb-3">
                Own a business in {townName}?
              </h3>
              <p className="text-blue-700 mb-6">
                Get your bulletin board on Switchboard for free. Customers can share what's new at your location.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/get-listed" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Your Business Listed
                </Link>
                <Link 
                  href="/start-town" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Start a New Town
                </Link>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
            <p className="mb-4">The local news nobody's covering.</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Link href="/about" className="hover:text-stone-700 transition-colors">About</Link>
              <Link href="/how-to-post" className="hover:text-stone-700 transition-colors">How to Post</Link>
              <Link href="/get-listed" className="hover:text-stone-700 transition-colors">Get Listed</Link>
              <Link href="/start-town" className="hover:text-stone-700 transition-colors">Start a Town</Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}