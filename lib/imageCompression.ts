/**
 * Compress image before upload
 * Bulletin board photos need high resolution for zooming/reading
 * @param file - Input image file
 * @param maxWidth - Maximum width in pixels (default: 3000 for readability)
 * @param quality - JPEG quality 0-1 (default: 0.92 for text clarity)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth = 3000,  // High res for zooming in to read flyers
  quality = 0.92    // High quality to preserve text readability
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, 1)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}