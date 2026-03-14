'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LocationWithPhoto } from '@/types'
import { getPhotoUrl } from '@/lib/utils'
import { DISCOVERY_CATEGORY_LABELS, getDiscoveryCategories, type DiscoveryCategory, type BusinessCategory } from '@/lib/businessProfiles'
import Link from 'next/link'
import Image from 'next/image'
import Supercluster from 'supercluster'
import { MapPin } from 'lucide-react'

interface MapViewProps {
  locations: LocationWithPhoto[]
  townSlug: string
  activeFilter?: DiscoveryCategory | 'all'
}

interface ClusterProperties {
  cluster: boolean
  cluster_id?: number
  point_count?: number
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

/* ── Helpers ─────────────────────────────────────────────────── */

/** Derive map center from locations, fallback to first location */
function deriveCenter(locations: LocationWithPhoto[]): { latitude: number; longitude: number } {
  const withCoords = locations.filter(l => l.latitude && l.longitude)
  if (withCoords.length === 0) return { latitude: 43.5548, longitude: -90.8886 }

  const sumLat = withCoords.reduce((s, l) => s + l.latitude!, 0)
  const sumLng = withCoords.reduce((s, l) => s + l.longitude!, 0)
  return {
    latitude: sumLat / withCoords.length,
    longitude: sumLng / withCoords.length,
  }
}

/* ── Component ───────────────────────────────────────────────── */

export default function MapView({ locations, townSlug, activeFilter = 'all' }: MapViewProps) {
  const center = useMemo(() => deriveCenter(locations), [locations])
  const [viewState, setViewState] = useState({
    ...center,
    zoom: 15.5,
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
        location,
      },
      geometry: {
        type: 'Point',
        coordinates: [location.longitude!, location.latitude!],
      },
    }))
  }, [filteredLocations])

  // Initialize supercluster
  useEffect(() => {
    superclusterRef.current = new Supercluster({
      radius: 60,
      maxZoom: 18,
      minPoints: 3,
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

  // Initial load — set clusters after map is ready
  useEffect(() => {
    if (!superclusterRef.current || points.length === 0) return

    const timeout = setTimeout(() => {
      const c = deriveCenter(filteredLocations)
      const initialBounds: [number, number, number, number] = [
        c.longitude - 0.07,
        c.latitude - 0.05,
        c.longitude + 0.07,
        c.latitude + 0.05,
      ]
      const initialClusters = superclusterRef.current!.getClusters(initialBounds, 15)
      if (initialClusters.length > 0) {
        setClusters(initialClusters)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [points, filteredLocations])

  // Re-center when town changes
  useEffect(() => {
    const c = deriveCenter(locations)
    setViewState({ ...c, zoom: 15.5 })
  }, [townSlug, locations])

  const handleClusterClick = (cluster: PointFeature) => {
    if (!superclusterRef.current || !mapRef.current) return

    const expansionZoom = Math.min(
      superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id!),
      20
    )

    mapRef.current.easeTo({
      center: cluster.geometry.coordinates,
      zoom: expansionZoom,
      duration: 500,
    })
  }

  return (
    <div
      className="h-[600px] w-full overflow-hidden"
      style={{
        border: '1px solid var(--sb-warm-gray)',
        borderRadius: 'var(--sb-radius)',
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={() => {
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
          const { cluster: isCluster, point_count, location } = cluster.properties

          if (isCluster) {
            // Cluster pin — Amber Gold circle
            const size = Math.min(30 + (point_count || 0) * 10, 60)
            return (
              <Marker
                key={`cluster-${cluster.properties.cluster_id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="flex items-center justify-center rounded-full cursor-pointer"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: 'var(--sb-amber)',
                    color: 'var(--sb-charcoal)',
                    border: '2px solid var(--sb-white)',
                  }}
                  onClick={() => handleClusterClick(cluster)}
                >
                  <span className="text-sm font-bold">{point_count}</span>
                </div>
              </Marker>
            )
          }

          // Individual pin — flat Amber Gold circle
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
              <div className="cursor-pointer" style={{ transform: 'translate(-50%, -100%)' }}>
                <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                  <circle
                    cx="14"
                    cy="14"
                    r="13"
                    fill="var(--sb-amber)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M 14 28 L 9 36 L 19 36 Z"
                    fill="var(--sb-amber)"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="4"
                    fill="white"
                    opacity="0.5"
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
                className="p-3 cursor-pointer"
                style={{
                  background: 'var(--sb-white)',
                  border: '1px solid var(--sb-warm-gray)',
                  borderRadius: 'var(--sb-radius)',
                  minWidth: '200px',
                }}
              >
                {selectedLocation.photo ? (
                  <div className="relative w-full h-32 mb-2 overflow-hidden" style={{ borderRadius: '4px' }}>
                    <Image
                      src={getPhotoUrl(selectedLocation.photo.storage_path)}
                      alt={selectedLocation.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-32 flex items-center justify-center mb-2"
                    style={{
                      background: 'var(--sb-warm-white)',
                      borderRadius: '4px',
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--sb-stone)' }}>No photo yet</span>
                  </div>
                )}

                <h3
                  className="text-sm font-bold leading-tight"
                  style={{ color: 'var(--sb-charcoal)' }}
                >
                  {selectedLocation.name}
                </h3>

                {selectedLocation.address && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--sb-slate)' }}
                  >
                    {selectedLocation.address}
                  </p>
                )}

                {selectedLocation.profile_completed && selectedLocation.business_category && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--sb-stone)' }}
                  >
                    {selectedLocation.business_category}
                  </p>
                )}

                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--sb-stone)' }}
                >
                  {selectedLocation.view_count} views
                </p>

                <p
                  className="text-xs font-semibold mt-2"
                  style={{ color: 'var(--sb-amber)' }}
                >
                  View board &rarr;
                </p>
              </div>
            </Link>
          </Popup>
        )}
      </Map>

      {/* Empty state */}
      {filteredLocations.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <div className="text-center">
            <MapPin size={32} color="var(--sb-stone)" className="mx-auto mb-3" />
            <p
              className="text-lg font-semibold mb-1"
              style={{ color: 'var(--sb-charcoal)' }}
            >
              No locations to show
            </p>
            <p className="text-sm" style={{ color: 'var(--sb-stone)' }}>
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
