'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Town } from '@/lib/types'
import TownForm from './TownForm'

interface TownsListProps {
  onTownsUpdated?: () => void
}

export default function TownsList({ onTownsUpdated }: TownsListProps) {
  const [towns, setTowns] = useState<Town[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTown, setSelectedTown] = useState<Town | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadTowns()
  }, [])

  async function loadTowns() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('towns')
      .select('*')
      .order('name')

    if (!error && data) {
      setTowns(data)
    }

    setIsLoading(false)
  }

  async function deactivateTown(id: string) {
    if (!confirm('Are you sure? This will deactivate the town and hide it from the site.')) return

    const { error } = await supabase
      .from('towns')
      .update({ is_active: false })
      .eq('id', id)

    if (!error) {
      await loadTowns()
      if (onTownsUpdated) onTownsUpdated()
    }
  }

  const handleFormSuccess = () => {
    loadTowns()
    setSelectedTown(null)
    setShowAddForm(false)
    if (onTownsUpdated) onTownsUpdated()
  }

  if (isLoading) return <div className="text-center py-4">Loading towns...</div>

  return (
    <div className="space-y-6">
      {!showAddForm && !selectedTown && (
        <div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-md font-semibold text-sm transition-colors" style={{ background: 'var(--sb-green)', color: '#fff' }}
          >
            Add New Town
          </button>
        </div>
      )}

      {showAddForm && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Create New Town</h3>
          <TownForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {selectedTown && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Edit Town: {selectedTown.name}</h3>
          <TownForm 
            town={selectedTown} 
            onSuccess={handleFormSuccess}
            onCancel={() => setSelectedTown(null)}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Towns ({towns.length})</h3>
        <div className="space-y-2">
          {towns.map((town, index) => (
            <div
              key={town.id}
              className="flex items-center justify-between p-4 rounded"
              style={{
                background: index % 2 === 1 ? '#F8F5F0' : 'var(--sb-white)',
                border: '1px solid var(--sb-warm-gray)',
              }}
            >
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--sb-charcoal)' }}>{town.name}</p>
                <p className="text-sm" style={{ color: 'var(--sb-stone)' }}>switchboard.town/{town.slug}</p>
                {town.description && (
                  <p className="text-sm mt-1" style={{ color: 'var(--sb-slate)' }}>{town.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: town.is_active ? '#DCFCE7' : '#FEE2E2',
                    color: town.is_active ? '#166534' : '#991B1B',
                  }}
                >
                  {town.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTown(town)}
                    className="btn-primary text-sm"
                    style={{ padding: '4px 12px', minHeight: 'auto' }}
                  >
                    Edit
                  </button>
                  {town.is_active && (
                    <button
                      onClick={() => deactivateTown(town.id)}
                      className="px-3 py-1 text-sm rounded"
                      style={{ background: 'var(--sb-red)', color: '#fff' }}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}