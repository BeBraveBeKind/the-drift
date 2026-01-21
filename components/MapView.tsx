'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LocationWithPhoto } from '@/types'
import { getPhotoUrl } from '@/lib/utils'
import { DISCOVERY_CATEGORY_LABELS, getDiscoveryCategories, type DiscoveryCategory, type BusinessCategory } from '@/lib/businessProfiles'
import Link from 'next/link'
import Image from 'next/image'
import Supercluster from 'supercluster'

// Color scheme for categories
const CATEGORY_COLORS: Record<DiscoveryCategory | 'other', string> = {
  'events': '#D94F4F',      // Red
  'services': '#5B9BD5',     // Blue
  'community': '#6BBF59',    // Green
  'for-sale': '#F4D03F',     // Yellow
  'food': '#FF8C42',         // Orange
  'other': '#9B59B6'         // Purple
}

// Get the primary category for a location (for pin color)
function getPrimaryCategory(location: LocationWithPhoto): DiscoveryCategory | 'other' {
  if (!location.business_category || !location.profile_completed) {
    return 'other'
  }
  const categories = getDiscoveryCategories(
    location.business_category as BusinessCategory, 
    location.business_tags || []
  )
  return categories[0] || 'other'
}

interface MapViewProps {
  locations: LocationWithPhoto[]
  townSlug: string
  activeFilter?: DiscoveryCategory | 'all'
}

interface ClusterProperties {
  cluster: boolean
  cluster_id?: number
  point_count?: number
  category?: DiscoveryCategory | 'other'
  location?: LocationWithPhoto
}

interface PointFeature {
  type: 'Feature'
  properties: ClusterProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export default function MapView({ locations, townSlug, activeFilter = 'all' }: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude: 43.5548,  // Downtown Viroqua
    longitude: -90.8886,
    zoom: 15.5  // Closer zoom to see downtown detail
  })
  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhoto | null>(null)
  const [clusters, setClusters] = useState<any[]>([])
  const mapRef = useRef<any>(null)
  const superclusterRef = useRef<Supercluster<ClusterProperties> | null>(null)

  // Filter locations that have coordinates
  const mappableLocations = useMemo(() => {
    return locations.filter(loc => loc.latitude && loc.longitude)
  }, [locations])

  // Apply category filter if active
  const filteredLocations = useMemo(() => {
    if (activeFilter === 'all') return mappableLocations

    return mappableLocations.filter(location => {
      if (!location.profile_completed) return false
      const categories = getDiscoveryCategories(
        location.business_category as BusinessCategory,
        location.business_tags || []
      )
      return categories.includes(activeFilter as DiscoveryCategory)
    })
  }, [mappableLocations, activeFilter])

  // Create GeoJSON points from locations
  const points = useMemo((): PointFeature[] => {
    return filteredLocations.map(location => ({
      type: 'Feature',
      properties: {
        cluster: false,
        category: getPrimaryCategory(location),
        location
      },
      geometry: {
        type: 'Point',
        coordinates: [location.longitude!, location.latitude!]
      }
    }))
  }, [filteredLocations])

  // Initialize supercluster
  useEffect(() => {
    superclusterRef.current = new Supercluster({
      radius: 60,  // Increased for better clustering at street level
      maxZoom: 18,
      minPoints: 3  // Require more pins before clustering
    })
    superclusterRef.current.load(points)
  }, [points])

  // Update clusters when viewport changes
  useEffect(() => {
    if (!superclusterRef.current || !mapRef.current) return

    const map = mapRef.current.getMap()
    const bounds = map.getBounds().toArray().flat() as [number, number, number, number]
    const zoom = Math.floor(map.getZoom())
    
    const newClusters = superclusterRef.current.getClusters(bounds, zoom)
    setClusters(newClusters)
  }, [viewState, points])

  // Initial load - set clusters after map is ready
  useEffect(() => {
    if (!superclusterRef.current || points.length === 0) return
    
    // Use a timeout to ensure map is fully initialized
    const timeout = setTimeout(() => {
      // Get initial clusters for Viroqua area
      const initialBounds: [number, number, number, number] = [
        -90.95, // west
        43.50,  // south  
        -90.82, // east
        43.60   // north
      ]
      const initialClusters = superclusterRef.current!.getClusters(initialBounds, 15)
      if (initialClusters.length > 0) {
        setClusters(initialClusters)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [points])

  // Keep map centered on downtown Viroqua
  // Don't auto-adjust based on locations
  useEffect(() => {
    // Always start with downtown view
    setViewState({
      latitude: 43.5548,  // Downtown Viroqua
      longitude: -90.8886,
      zoom: 15.5
    })
  }, [townSlug])  // Only reset when changing towns

  const handleClusterClick = (cluster: PointFeature) => {
    if (!superclusterRef.current || !mapRef.current) return

    const expansionZoom = Math.min(
      superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id!),
      20
    )

    mapRef.current.easeTo({
      center: cluster.geometry.coordinates,
      zoom: expansionZoom,
      duration: 500
    })
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border-2 border-[#E5E5E5]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={() => {
          // Force cluster update when map loads
          if (superclusterRef.current && mapRef.current) {
            const map = mapRef.current.getMap()
            const bounds = map.getBounds().toArray().flat() as [number, number, number, number]
            const zoom = Math.floor(map.getZoom())
            const initialClusters = superclusterRef.current.getClusters(bounds, zoom)
            setClusters(initialClusters)
          }
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl 
          position="top-right"
          trackUserLocation={false}
        />

        {/* Render clusters and individual pins */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates
          const { cluster: isCluster, point_count, category, location } = cluster.properties

          if (isCluster) {
            // Render cluster
            return (
              <Marker
                key={`cluster-${cluster.properties.cluster_id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="flex items-center justify-center bg-[#5B9BD5] text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    width: `${30 + (point_count || 0) * 10}px`,
                    height: `${30 + (point_count || 0) * 10}px`,
                    maxWidth: '60px',
                    maxHeight: '60px'
                  }}
                  onClick={() => handleClusterClick(cluster)}
                >
                  <span className="text-[14px] font-bold">{point_count}</span>
                </div>
              </Marker>
            )
          }

          // Render individual pin
          return (
            <Marker
              key={location?.id}
              latitude={latitude}
              longitude={longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedLocation(location || null)
              }}
            >
              <div 
                className="cursor-pointer hover:scale-110 transition-transform"
                style={{ transform: 'translate(-50%, -100%)' }}
              >
                {/* Custom pushpin SVG */}
                <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
                  <circle 
                    cx="15" 
                    cy="15" 
                    r="14" 
                    fill={CATEGORY_COLORS[(category as DiscoveryCategory) || 'other']}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path 
                    d="M 15 30 L 10 40 L 20 40 Z" 
                    fill={CATEGORY_COLORS[(category as DiscoveryCategory) || 'other']}
                  />
                  <circle 
                    cx="15" 
                    cy="15" 
                    r="5" 
                    fill="white"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </Marker>
          )
        })}

        {/* Popup for selected location */}
        {selectedLocation && (
          <Popup
            latitude={selectedLocation.latitude!}
            longitude={selectedLocation.longitude!}
            anchor="bottom"
            onClose={() => setSelectedLocation(null)}
            closeOnClick={false}
            className="map-popup"
          >
            <Link 
              href={`/${townSlug}/${selectedLocation.slug}`}
              className="block no-underline"
            >
              <div 
                className="bg-[#FFFEF9] p-3 shadow-lg border-[1px] border-[#E5E5E5] cursor-pointer hover:shadow-xl transition-shadow"
                style={{ 
                  transform: `rotate(${Math.random() * 4 - 2}deg)`,
                  minWidth: '200px'
                }}
              >
                {selectedLocation.photo ? (
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={getPhotoUrl(selectedLocation.photo.storage_path)}
                      alt={selectedLocation.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-stone-100 flex items-center justify-center mb-2">
                    <span className="text-stone-400 text-[12px]">No photo yet</span>
                  </div>
                )}
                
                <h3 className="text-[14px] font-bold text-[#2C2C2C] leading-tight">
                  {selectedLocation.name}
                </h3>
                
                {selectedLocation.address && (
                  <p className="text-[11px] text-[#6B6B6B] mt-1">
                    {selectedLocation.address}
                  </p>
                )}
                
                {selectedLocation.profile_completed && selectedLocation.business_category && (
                  <div className="mt-2">
                    <span 
                      className="inline-block px-2 py-1 rounded-full text-[10px] text-white font-medium"
                      style={{ backgroundColor: CATEGORY_COLORS[getPrimaryCategory(selectedLocation)] }}
                    >
                      {DISCOVERY_CATEGORY_LABELS[getPrimaryCategory(selectedLocation) as DiscoveryCategory] || 'Other'}
                    </span>
                  </div>
                )}
                
                <p className="text-[11px] text-[#6B6B6B] mt-2">
                  {selectedLocation.view_count} views
                </p>
              </div>
            </Link>
          </Popup>
        )}
      </Map>

      {/* Empty state */}
      {filteredLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
          <div className="text-center">
            <p className="text-[18px] font-bold text-[#2C2C2C] mb-2">
              🗺️ No locations to show
            </p>
            <p className="text-[14px] text-[#6B6B6B]">
              {activeFilter !== 'all' 
                ? `No boards match the "${DISCOVERY_CATEGORY_LABELS[activeFilter as DiscoveryCategory]}" filter`
                : 'No locations have coordinates yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}