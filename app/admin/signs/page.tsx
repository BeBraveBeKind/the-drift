'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Download } from 'lucide-react'

const PRESETS = [
  { value: '4x6', label: 'Postcard — 4×6"' },
  { value: '5x7', label: 'Small flyer — 5×7"' },
  { value: '6x9', label: 'Standard sign — 6×9"' },
  { value: '8.5x11', label: 'Full letter — 8.5×11"' },
  { value: '5.5x8.5', label: 'Half letter — 5.5×8.5"' },
  { value: 'custom', label: 'Custom size' },
]

interface Town {
  id: string
  name: string
  slug: string
}

interface Location {
  id: string
  name: string
  slug: string
}

export default function AdminSignsPage() {
  const [towns, setTowns] = useState<Town[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedTown, setSelectedTown] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [sizePreset, setSizePreset] = useState('6x9')
  const [customW, setCustomW] = useState('12')
  const [customH, setCustomH] = useState('18')
  const [previewUrl, setPreviewUrl] = useState('')

  // Fetch towns on mount
  useEffect(() => {
    supabase
      .from('towns')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        if (data) setTowns(data)
      })
  }, [])

  // Fetch locations when town changes
  useEffect(() => {
    if (!selectedTown) {
      setLocations([])
      setSelectedLocation('')
      return
    }
    const town = towns.find(t => t.slug === selectedTown)
    if (!town) return

    supabase
      .from('locations')
      .select('id, name, slug')
      .eq('town_id', town.id)
      .order('name')
      .then(({ data }) => {
        if (data) setLocations(data)
        setSelectedLocation('')
      })
  }, [selectedTown, towns])

  // Update preview when selections change
  useEffect(() => {
    if (!selectedTown || !selectedLocation) {
      setPreviewUrl('')
      return
    }
    const size = sizePreset === 'custom' ? `${customW}x${customH}` : sizePreset
    setPreviewUrl(`/api/sign/${selectedTown}/${selectedLocation}?size=${size}`)
  }, [selectedTown, selectedLocation, sizePreset, customW, customH])

  const size = sizePreset === 'custom' ? `${customW}x${customH}` : sizePreset

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sb-warm-white)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--sb-charcoal)',
            marginBottom: 8,
          }}
        >
          Sign Generator
        </h1>
        <p style={{ color: 'var(--sb-stone)', fontSize: 15, marginBottom: 32 }}>
          Generate printable QR code signs for bulletin boards.
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {/* Town */}
          <div>
            <label style={labelStyle}>Town</label>
            <select
              value={selectedTown}
              onChange={e => setSelectedTown(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select a town</option>
              {towns.map(t => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Business */}
          <div>
            <label style={labelStyle}>Business</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              style={selectStyle}
              disabled={!selectedTown}
            >
              <option value="">{selectedTown ? 'Select a business' : 'Pick a town first'}</option>
              {locations.map(l => (
                <option key={l.id} value={l.slug}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label style={labelStyle}>Size</label>
            <select
              value={sizePreset}
              onChange={e => setSizePreset(e.target.value)}
              style={selectStyle}
            >
              {PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Custom dimensions */}
          {sizePreset === 'custom' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Width (inches)</label>
                <input
                  type="number"
                  min="2"
                  max="48"
                  step="0.5"
                  value={customW}
                  onChange={e => setCustomW(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <span style={{ color: 'var(--sb-stone)', fontSize: 18, paddingBottom: 10 }}>×</span>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Height (inches)</label>
                <input
                  type="number"
                  min="2"
                  max="48"
                  step="0.5"
                  value={customH}
                  onChange={e => setCustomH(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* Download button */}
        {previewUrl && (
          <a
            href={previewUrl}
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'var(--sb-amber)',
              color: 'var(--sb-charcoal)',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 8,
              textDecoration: 'none',
              marginBottom: 32,
            }}
          >
            <Download size={16} />
            Download {size} Sign
          </a>
        )}

        {/* Preview */}
        {previewUrl && (
          <div
            style={{
              border: '1px solid var(--sb-warm-gray)',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--sb-white)',
              padding: 24,
            }}
          >
            <p style={{ color: 'var(--sb-stone)', fontSize: 13, marginBottom: 16 }}>Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Sign preview"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--sb-charcoal)',
  marginBottom: 6,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  borderRadius: 8,
  border: '1px solid var(--sb-warm-gray)',
  background: 'var(--sb-white)',
  color: 'var(--sb-charcoal)',
  appearance: 'auto',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  borderRadius: 8,
  border: '1px solid var(--sb-warm-gray)',
  background: 'var(--sb-white)',
  color: 'var(--sb-charcoal)',
}
