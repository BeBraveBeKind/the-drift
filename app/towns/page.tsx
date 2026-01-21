import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 60 // Revalidate every minute

// Get towns with board counts
async function getTownsWithBoards() {
  // Get active towns
  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')
  
  if (!towns || towns.length === 0) return []
  
  // Get board counts for each town
  const townsWithCounts = await Promise.all(
    towns.map(async (town) => {
      const { count } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('town_id', town.id)
        .eq('is_active', true)
      
      return {
        ...town,
        boardCount: count || 0
      }
    })
  )
  
  // Group by state (for now just Wisconsin)
  return [
    {
      state: 'Wisconsin',
      stateAbbr: 'WI',
      towns: townsWithCounts.map(town => ({
        name: town.name.charAt(0).toUpperCase() + town.name.slice(1),
        slug: town.slug,
        population: '4,500', // This could be stored in the database later
        established: '2026',
        boardCount: town.boardCount,
        description: 'Heart of the Driftless Region'
      }))
    }
  ]
}

export default async function TownsPage() {
  const ACTIVE_TOWNS = await getTownsWithBoards()
  return (
    <>
      <Navigation />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-2xl mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display mb-4" style={{ color: 'var(--text-primary)' }}>
              Switchboard Communities
            </h1>
            <p className="text-subhead" style={{ color: 'var(--text-secondary)' }}>
              Connect with your local community bulletin board
            </p>
          </div>

          {/* Active Communities Card */}
          <section className="mb-12">
            <div className="rounded-lg border-2 overflow-hidden" style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)'
            }}>
              {/* Card Header */}
              <div className="p-6 border-b" style={{ 
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)'
              }}>
                <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  Active Communities
                </h2>
              </div>

              {/* Communities List */}
              <div className="p-6">
                {ACTIVE_TOWNS.map((stateGroup) => (
                  <div key={stateGroup.state}>
                    {/* State Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                        <rect x="2" y="2" width="20" height="16" rx="2" 
                          stroke="currentColor" strokeWidth="2" 
                          style={{ color: 'var(--text-secondary)' }}
                        />
                        <circle cx="8" cy="10" r="2" fill="currentColor" 
                          style={{ color: 'var(--accent)' }}
                        />
                      </svg>
                      <h3 className="text-[18px] font-semibold uppercase tracking-wide" 
                        style={{ color: 'var(--text-secondary)' }}>
                        {stateGroup.state}
                      </h3>
                    </div>

                    {/* Town Rows */}
                    <div className="space-y-4">
                      {stateGroup.towns.map((town) => (
                        <Link
                          key={town.slug}
                          href={`/${town.slug}`}
                          className="block group"
                          style={{ textDecoration: 'none' }}
                        >
                          <div 
                            className="p-5 rounded-lg border transition-all hover:shadow-lg hover:border-2"
                            style={{ 
                              backgroundColor: 'var(--bg-page)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            {/* Town Info Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none"
                                    style={{ color: 'var(--accent)' }}>
                                    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 16 12 16s12-7 12-16c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" 
                                      fill="currentColor"/>
                                  </svg>
                                  <div>
                                    <h4 className="text-[20px] font-bold group-hover:underline" 
                                      style={{ color: 'var(--text-primary)' }}>
                                      {town.name}, {stateGroup.stateAbbr}
                                    </h4>
                                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                                      {town.description}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Stats Row */}
                                <div className="flex gap-6 ml-8">
                                  <div>
                                    <span className="text-[12px] uppercase tracking-wide" 
                                      style={{ color: 'var(--text-muted)' }}>
                                      Population: 
                                    </span>
                                    <span className="text-[14px] font-semibold ml-2" 
                                      style={{ color: 'var(--text-primary)' }}>
                                      {town.population}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[12px] uppercase tracking-wide" 
                                      style={{ color: 'var(--text-muted)' }}>
                                      Boards: 
                                    </span>
                                    <span className="text-[14px] font-semibold ml-2" 
                                      style={{ color: 'var(--text-primary)' }}>
                                      {town.boardCount}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[12px] uppercase tracking-wide" 
                                      style={{ color: 'var(--text-muted)' }}>
                                      Since: 
                                    </span>
                                    <span className="text-[14px] font-semibold ml-2" 
                                      style={{ color: 'var(--text-primary)' }}>
                                      {town.established}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="ml-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" 
                                  fill="none" stroke="currentColor" strokeWidth="2"
                                  className="group-hover:translate-x-1 transition-transform"
                                  style={{ color: 'var(--link)' }}>
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* More Coming Soon */}
              <div className="p-4 text-center border-t" style={{ 
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)'
              }}>
                <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                  More communities coming soon...
                </p>
              </div>
            </div>
          </section>

          {/* Expansion CTA Card */}
          <section className="mb-12">
            <div className="p-8 rounded-lg text-center border-2" style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--accent)',
              borderStyle: 'dashed'
            }}>
              <h2 className="text-heading mb-4" style={{ color: 'var(--text-primary)' }}>
                Want Switchboard in your town?
              </h2>
              <p className="text-body mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                We're looking for partners to bring community bulletin boards to more towns. Help us expand!
              </p>
              <Link href="/start-town" className="btn-primary">
                Become a Partner
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}