import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MapPin, ChevronRight } from 'lucide-react'

export const revalidate = 60

async function getTownsWithBoards() {
  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (!towns || towns.length === 0) return []

  const townsWithCounts = await Promise.all(
    towns.map(async (town) => {
      const { count } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('town_id', town.id)
        .eq('is_active', true)

      return {
        ...town,
        boardCount: count || 0,
      }
    })
  )

  return townsWithCounts.map((town) => ({
    name: town.name.charAt(0).toUpperCase() + town.name.slice(1),
    slug: town.slug,
    boardCount: town.boardCount,
  }))
}

export default async function TownsPage() {
  const towns = await getTownsWithBoards()

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-4 py-12">

          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Switchboard Communities
            </h1>
            <p className="text-base" style={{ color: 'var(--sb-stone)' }}>
              Find your local bulletin board
            </p>
          </div>

          {/* Town list */}
          <div className="mb-10">
            {towns.map((town) => (
              <Link
                key={town.slug}
                href={`/${town.slug}`}
                className="flex items-center justify-between py-4"
                style={{
                  borderBottom: '1px solid var(--sb-warm-gray)',
                  textDecoration: 'none',
                  minHeight: '56px',
                }}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} color="var(--sb-amber)" />
                  <div>
                    <span
                      className="text-base font-semibold"
                      style={{ color: 'var(--sb-charcoal)' }}
                    >
                      {town.name}
                    </span>
                    <span
                      className="text-sm ml-2"
                      style={{ color: 'var(--sb-stone)', fontWeight: 300 }}
                    >
                      {town.boardCount} {town.boardCount === 1 ? 'board' : 'boards'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--sb-stone)" />
              </Link>
            ))}
          </div>

          {/* Expansion CTA */}
          <div
            className="p-8 text-center mb-10"
            style={{
              border: '2px dashed var(--sb-amber)',
              borderRadius: 'var(--sb-radius)',
              background: 'var(--sb-warm-white)',
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              Want Switchboard in your town?
            </h2>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--sb-stone)' }}
            >
              We&rsquo;re looking for partners to bring community bulletin boards to more towns.
            </p>
            <Link
              href="/start-town"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-base no-underline"
              style={{
                background: 'var(--sb-amber)',
                color: 'var(--sb-charcoal)',
                borderRadius: '6px',
                minHeight: '48px',
              }}
            >
              Become a Partner
            </Link>
          </div>

          <Footer />
        </div>
      </main>
    </>
  )
}
