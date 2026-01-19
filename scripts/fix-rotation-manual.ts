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

async function fixImageRotationManual(locationSlug: string, degrees: number) {
  try {
    console.log(`Manually rotating image for ${locationSlug} by ${degrees} degrees...\n`)
    
    // Get the photo for this location
    const { data: photos, error } = await supabase
      .from('photos')
      .select(`
        *,
        location:locations!inner(
          slug,
          name
        )
      `)
      .eq('is_current', true)
      .eq('location.slug', locationSlug)
    
    if (error) {
      console.error('Error fetching photos:', error)
      return
    }
    
    if (!photos || photos.length === 0) {
      console.log('No photos found for this location')
      return
    }
    
    const photo = photos[0]
    
    console.log(`Processing ${photo.location.name} (${photo.storage_path})...`)
    
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('board-photos')
      .download(photo.storage_path)
    
    if (downloadError) {
      console.error(`Error downloading ${photo.storage_path}:`, downloadError)
      return
    }
    
    // Convert to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Process with sharp - manually rotate by specified degrees
    const processedBuffer = await sharp(buffer)
      .rotate(degrees) // Manual rotation by specified degrees
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
      return
    }
    
    console.log(`✓ Successfully rotated ${photo.location.name} by ${degrees} degrees`)
    console.log('\nNote: You may need to clear your browser cache or hard refresh (Cmd+Shift+R) to see the updated image.')
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Get location slug and rotation from command line arguments
const locationSlug = process.argv[2]
const degrees = parseInt(process.argv[3] || '90')

if (!locationSlug) {
  console.log('Usage: npm run fix-rotation-manual <location-slug> [degrees]')
  console.log('Example: npm run fix-rotation-manual woolly-bear-taphouse 90')
  console.log('Degrees can be: 90, 180, 270, -90, etc.')
  process.exit(1)
}

// Run the fix
fixImageRotationManual(locationSlug, degrees)