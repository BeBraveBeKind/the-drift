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
              sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 280px"
              className="board-card-polaroid__image"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority={index < 8}
              loading={index < 8 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
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