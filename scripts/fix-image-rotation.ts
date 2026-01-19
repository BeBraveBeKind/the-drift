import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixImageRotation(locationSlug?: string) {
  try {
    console.log('Fetching photos to fix rotation...\n')
    
    // Build query
    let query = supabase
      .from('photos')
      .select(`
        *,
        location:locations!inner(
          slug,
          name
        )
      `)
      .eq('is_current', true)
    
    // If specific location provided, filter by it
    if (locationSlug) {
      query = query.eq('location.slug', locationSlug)
    }
    
    const { data: photos, error } = await query
    
    if (error) {
      console.error('Error fetching photos:', error)
      return
    }
    
    if (!photos || photos.length === 0) {
      console.log('No photos found')
      return
    }
    
    console.log(`Found ${photos.length} photo(s) to check\n`)
    
    for (const photo of photos) {
      try {
        console.log(`Processing ${photo.location.name} (${photo.storage_path})...`)
        
        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('board-photos')
          .download(photo.storage_path)
        
        if (downloadError) {
          console.error(`Error downloading ${photo.storage_path}:`, downloadError)
          continue
        }
        
        // Convert to buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Process with sharp - auto-rotate and optimize
        const processedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF orientation
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .resize(2048, 2048, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .toBuffer()
        
        // Upload the fixed version (overwrites existing)
        const { error: uploadError } = await supabase
          .storage
          .from('board-photos')
          .update(photo.storage_path, processedBuffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`Error uploading fixed image:`, uploadError)
          continue
        }
        
        console.log(`✓ Successfully fixed rotation for ${photo.location.name}`)
        
      } catch (error) {
        console.error(`Error processing photo ${photo.id}:`, error)
      }
    }
    
    console.log('\nRotation fix complete!')
    console.log('Note: You may need to clear your browser cache to see the updated images.')
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Get location slug from command line argument
const locationSlug = process.argv[2]

if (locationSlug) {
  console.log(`Fixing rotation for location: ${locationSlug}\n`)
} else {
  console.log('Fixing rotation for all current photos\n')
}

// Run the fix
fixImageRotation(locationSlug)