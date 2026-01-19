import { createClient } from '@supabase/supabase-js'
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

async function checkPhotos() {
  try {
    console.log('Checking photos in database...\n')
    
    // Get all photos
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching photos:', error)
      return
    }
    
    if (!photos || photos.length === 0) {
      console.log('No photos found in database')
      return
    }
    
    console.log(`Found ${photos.length} photos total\n`)
    
    // Group by file type
    const heicPhotos = photos.filter(p => 
      p.storage_path?.toLowerCase().endsWith('.heic') || 
      p.storage_path?.toLowerCase().endsWith('.heif')
    )
    const jpgPhotos = photos.filter(p => 
      p.storage_path?.toLowerCase().endsWith('.jpg') || 
      p.storage_path?.toLowerCase().endsWith('.jpeg')
    )
    const otherPhotos = photos.filter(p => 
      !heicPhotos.includes(p) && !jpgPhotos.includes(p)
    )
    
    console.log(`HEIC/HEIF photos: ${heicPhotos.length}`)
    if (heicPhotos.length > 0) {
      console.log('HEIC photo paths:')
      heicPhotos.forEach(p => {
        console.log(`  - ${p.storage_path} (Location ID: ${p.location_id})`)
      })
    }
    
    console.log(`\nJPEG photos: ${jpgPhotos.length}`)
    if (jpgPhotos.length > 0 && jpgPhotos.length <= 10) {
      console.log('JPEG photo paths:')
      jpgPhotos.forEach(p => {
        console.log(`  - ${p.storage_path} (Location ID: ${p.location_id})`)
      })
    }
    
    if (otherPhotos.length > 0) {
      console.log(`\nOther format photos: ${otherPhotos.length}`)
      otherPhotos.forEach(p => {
        console.log(`  - ${p.storage_path} (Location ID: ${p.location_id})`)
      })
    }
    
    // Check storage bucket
    console.log('\n\nChecking storage bucket...')
    const { data: files, error: listError } = await supabase
      .storage
      .from('photos')
      .list('', {
        limit: 1000,
        offset: 0
      })
    
    if (listError) {
      console.error('Error listing storage files:', listError)
    } else if (files) {
      console.log(`Found ${files.length} items in storage root`)
      
      // Check each folder
      const folders = files.filter(f => !f.name.includes('.'))
      for (const folder of folders) {
        const { data: folderFiles } = await supabase
          .storage
          .from('photos')
          .list(folder.name, {
            limit: 100
          })
        
        if (folderFiles && folderFiles.length > 0) {
          console.log(`\nFolder: ${folder.name}`)
          folderFiles.forEach(f => {
            console.log(`  - ${f.name}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Run the check
checkPhotos()