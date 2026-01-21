'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getPhotoUrl } from '@/lib/utils'
import type { LocationWithPhoto } from '@/types'

interface BoardCardProps {
  board: LocationWithPhoto
  townSlug: string
  index: number
}

export default function BoardCard({ board, townSlug, index }: BoardCardProps) {
  return (
    <Link
      key={board.id}
      href={`/${townSlug}/${board.slug}`}
      className="board-card-polaroid group block"
    >
      <div className="board-card-polaroid__frame">
        <div className="board-card-polaroid__image-wrapper">
          {board.photo ? (
            <Image 
              src={getPhotoUrl(board.photo.storage_path)}
              alt={board.name}
              width={280}
              height={210}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              className="board-card-polaroid__image"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority={index < 6}
              loading={index < 6 ? undefined : "lazy"}
            />
          ) : (
            <div className="board-card-polaroid__image board-card-polaroid__image--placeholder">
              <span style={{ fontSize: '1.5rem', opacity: 0.3, color: 'var(--text-muted)' }}>No photo</span>
            </div>
          )}
        </div>
        
        <div className="board-card-polaroid__content">
          <h3 className="board-card-polaroid__title">
            {board.name}
          </h3>
          {/* Business category and tags */}
          {(board.business_category || (board.business_tags && board.business_tags.length > 0)) && (
            <p className="board-card-polaroid__category">
              {[board.business_category, ...(board.business_tags || [])]
                .filter(Boolean)
                .slice(0, 2)
                .join(' • ')}
            </p>
          )}
          <p className="board-card-polaroid__meta">
            {board.photo 
              ? `Updated ${new Date(board.photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'No photo yet'
            }
          </p>
        </div>
      </div>
    </Link>
  )
}