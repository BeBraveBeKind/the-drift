'use client'

import { useState } from 'react'
import { compressImage, formatFileSize } from '@/lib/imageCompression'
import type { PhotoUploaderProps } from '@/types'

export default function PhotoUploader({ onUpload, isLoading }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState('')
  const [compressedFile, setCompressedFile] = useState<File | null>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setError('')
    setFileName(file.name)
    setOriginalSize(file.size)
    setIsCompressing(true)

    try {
      // Show preview of original
      const reader = new FileReader()
      reader.onload = (evt) => {
        setPreview(evt.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Compress image
      const compressedBlob = await compressImage(file)
      setCompressedSize(compressedBlob.size)

      // Create File object from blob
      const compressedFileObj = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, '') + '.jpg',
        { type: 'image/jpeg' }
      )
      setCompressedFile(compressedFileObj)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress image')
    } finally {
      setIsCompressing(false)
    }
  }

  async function handleUpload() {
    if (!compressedFile) {
      setError('No image selected')
      return
    }

    try {
      await onUpload(compressedFile)
      // Reset form
      setPreview(null)
      setFileName('')
      setCompressedFile(null)
      setOriginalSize(0)
      setCompressedSize(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-700 text-sm">
          {error}
        </div>
      )}

      {/* File Input */}
      <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400">
        <input
          type="file"
          accept="image/*,.heic,.HEIC,.heif,.HEIF"
          onChange={handleFileSelect}
          disabled={isLoading || isCompressing}
          className="hidden"
          id="photo-input"
        />
        <label htmlFor="photo-input" className="cursor-pointer">
          <div className="text-4xl mb-2">📷</div>
          <p className="font-medium text-stone-900">
            {fileName || 'Click to upload photo'}
          </p>
          <p className="text-sm text-stone-500">
            {fileName ? `Selected: ${fileName}` : 'or drag and drop'}
          </p>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Preview</p>
          <div className="relative w-full max-w-sm aspect-video bg-stone-100 rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Compression Info */}
      {compressedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">▶ Image ready to upload</p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Original: {formatFileSize(originalSize)}</p>
            <p>Compressed: {formatFileSize(compressedSize)}</p>
            <p>
              Saved: {formatFileSize(originalSize - compressedSize)} (
              {Math.round((1 - compressedSize / originalSize) * 100)}%)
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!compressedFile || isLoading || isCompressing}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCompressing ? 'Compressing...' : isLoading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  )
}