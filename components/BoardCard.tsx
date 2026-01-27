'use client'

import Link from 'next/link'
import OptimizedBoardImage from './OptimizedBoardImage'
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
            <OptimizedBoardImage
              src={getPhotoUrl(board.photo.storage_path)}
              alt={board.name}
              index={index}
            />
          ) : (
            <div className="board-card-polaroid__image board-card-polaroid__image--placeholder">
              <span style={{ fontSize: '1.5rem', opacity: 0.3, color: 'var(--text-muted)' }}>No photo</span>
            </div>
          )}
        </div>
        
        <div className="board-card-polaroid__content">
          <h3 className="board-card-polaroid__title" style={{ minHeight: '1.5em' }}>
            {board.name}
          </h3>
          {/* Business category and tags */}
          <p className="board-card-polaroid__category" style={{ minHeight: '1.2em' }}>
            {(board.business_category || (board.business_tags && board.business_tags.length > 0)) ? 
              [board.business_category, ...(board.business_tags || [])]
                .filter(Boolean)
                .slice(0, 2)
                .join(' • ')
              : ' '
            }
          </p>
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