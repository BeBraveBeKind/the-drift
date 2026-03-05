'use client'

import Link from 'next/link'
import OptimizedBoardImage from './OptimizedBoardImage'
import FreshnessIndicator from './FreshnessIndicator'
import { getPhotoUrl } from '@/lib/utils'
import { Image as ImageIcon } from 'lucide-react'
import type { LocationWithPhoto } from '@/types'

interface BoardCardProps {
  board: LocationWithPhoto
  townSlug: string
  index: number
}

/**
 * Grid card for town homepage.
 * Design system: flat card, square-crop photo, 8px radius,
 * border only (no shadows), freshness badge.
 */
export default function BoardCard({ board, townSlug, index }: BoardCardProps) {
  return (
    <Link
      href={`/${townSlug}/${board.slug}`}
      className="board-card"
    >
      <div className="board-card__image-wrapper">
        {board.photo ? (
          <OptimizedBoardImage
            src={getPhotoUrl(board.photo.storage_path)}
            alt={board.name}
            index={index}
          />
        ) : (
          <div className="board-card__image-wrapper flex items-center justify-center">
            <ImageIcon size={32} color="var(--sb-stone)" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="board-card__content">
        <h3 className="board-card__title">{board.name}</h3>
        {board.business_category && (
          <p className="board-card__category">{board.business_category}</p>
        )}
        <div className="mt-1">
          <FreshnessIndicator
            updatedAt={board.photo?.created_at}
            variant="badge"
          />
        </div>
      </div>
    </Link>
  )
}
