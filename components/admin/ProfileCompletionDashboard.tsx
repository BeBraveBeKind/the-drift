'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BUSINESS_CATEGORY_LABELS } from '@/lib/businessProfiles'
import type { Location, Town } from '@/types'

interface ProfileStats {
  total: number
  completed: number
  pending: number
  completionRate: number
}

export default function ProfileCompletionDashboard() {
  const [stats, setStats] = useState<ProfileStats>({ total: 0, completed: 0, pending: 0, completionRate: 0 })
  const [pendingLocations, setPendingLocations] = useState<(Location & { town_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Get overall stats
      const { data: allLocations } = await supabase
        .from('locations')
        .select('id, profile_completed, is_active')
        .eq('is_active', true)

      if (allLocations) {
        const total = allLocations.length
        const completed = allLocations.filter(loc => loc.profile_completed).length
        const pending = total - completed
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        setStats({ total, completed, pending, completionRate })
      }

      // Get pending locations with town info
      const { data: pendingLocs } = await supabase
        .from('locations')
        .select(`
          *,
          towns!locations_town_id_fkey (
            name
          )
        `)
        .eq('is_active', true)
        .eq('profile_completed', false)
        .order('created_at', { ascending: false })

      if (pendingLocs) {
        const formatted = pendingLocs.map(loc => ({
          ...loc,
          town_name: loc.towns?.name || 'Unknown'
        }))
        setPendingLocations(formatted)
      }
    } catch (error) {
      console.error('Failed to load profile stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
        <div className="text-center py-8">
          <div className="text-[#6B6B6B]">Loading profile completion stats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
        <h2 className="text-[18px] font-semibold text-[#2C2C2C] mb-4">Business Profile Completion</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-[24px] font-bold text-[#2C2C2C]">{stats.total}</div>
            <div className="text-[12px] text-[#6B6B6B]">Total Locations</div>
          </div>
          <div className="text-center">
            <div className="text-[24px] font-bold text-[#6BBF59]">{stats.completed}</div>
            <div className="text-[12px] text-[#6B6B6B]">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-[24px] font-bold text-[#D94F4F]">{stats.pending}</div>
            <div className="text-[12px] text-[#6B6B6B]">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-[24px] font-bold text-[#5B9BD5]">{stats.completionRate}%</div>
            <div className="text-[12px] text-[#6B6B6B]">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[12px] text-[#6B6B6B] mb-2">
            <span>Profile Completion Progress</span>
            <span>{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-[#6BBF59] h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPending(!showPending)}
            className="bg-[#D94F4F] text-white px-4 py-2 rounded-md text-[14px] hover:bg-[#c44545] transition-colors"
            disabled={stats.pending === 0}
          >
            {showPending ? 'Hide' : 'Show'} Pending Profiles ({stats.pending})
          </button>
          <button
            onClick={loadStats}
            className="bg-[#5B9BD5] text-white px-4 py-2 rounded-md text-[14px] hover:bg-[#4a8bc2] transition-colors"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Pending Profiles List */}
      {showPending && stats.pending > 0 && (
        <div className="bg-[#FFFEF9] p-6 rounded-lg border border-[#E5E5E5] shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#2C2C2C] mb-4">
            Locations Missing Business Profiles
          </h3>
          
          <div className="space-y-3">
            {pendingLocations.map(location => (
              <div key={location.id} className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-[14px] font-medium text-[#856404]">
                      {location.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] text-[#856404]">
                        Town: {location.town_name}
                      </span>
                      <span className="text-[12px] text-[#856404]">
                        Created: {new Date(location.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[12px] text-[#856404]">
                        Views: {location.view_count}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#856404] text-[#FFF3CD] px-2 py-1 rounded text-[11px] font-medium">
                      Profile Incomplete
                    </span>
                  </div>
                </div>
                
                {location.business_category && (
                  <div className="mt-2">
                    <span className="text-[12px] text-[#856404]">
                      Category: {BUSINESS_CATEGORY_LABELS[location.business_category as keyof typeof BUSINESS_CATEGORY_LABELS] || location.business_category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pendingLocations.length === 0 && (
            <div className="text-center py-8 text-[#6B6B6B]">
              No pending profiles found. All locations have completed their business profiles!
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#E8F5E8] border border-[#C3E6C3] rounded-lg p-4">
        <h4 className="text-[14px] font-medium text-[#2C2C2C] mb-2">💡 Tips for Better Discovery</h4>
        <ul className="text-[12px] text-[#2C2C2C] space-y-1">
          <li>• Locations with completed profiles appear in category filters</li>
          <li>• Business owners can update their profiles anytime in the admin dashboard</li>
          <li>• Higher completion rates lead to better user discovery experience</li>
          <li>• Consider reaching out to locations with high views but missing profiles</li>
        </ul>
      </div>
    </div>
  )
}