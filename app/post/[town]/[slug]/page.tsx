'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ town: string; slug: string }>
}

export default function PostPage({ params }: PageProps) {
  const { town, slug } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setError(null)
    
    // Debug logging
    console.log('Upload starting with params:', { town, slug, hasFile: !!file })
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)
      formData.append('town', town)
      
      // Debug what we're sending
      console.log('FormData contents:', {
        file: file.name,
        slug,
        town,
        formDataKeys: Array.from(formData.keys())
      })
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }
      
      setDone(true)
      setTimeout(() => router.push(`/${town}/${slug}`), 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }
  
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📌</div>
          <p className="text-xl font-medium">Posted to Switchboard</p>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <div className="max-w-xs w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Post to Switchboard</h1>
        <p className="text-stone-500 mb-4">
          Snap a photo of the board. Give your post a longer life.
        </p>
        
        {/* Debug info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div>Town: {town || 'undefined'}</div>
          <div>Slug: {slug || 'undefined'}</div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.HEIC"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-4 px-6 bg-stone-900 text-white font-medium rounded-lg 
                     hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : '📷 Take Photo'}
        </button>
        
        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
        
        <p className="mt-8 text-xs text-stone-400">
          Your photo will be public on Switchboard
        </p>
      </div>
    </main>
  )
}