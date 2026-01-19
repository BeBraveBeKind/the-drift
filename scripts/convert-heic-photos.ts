import { createClient } from '@supabase/supabase-js'
import convert from 'heic-convert'
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

async function convertHeicPhotos() {
  try {
    console.log('Fetching HEIC photos from database...')
    
    // Get all HEIC photos
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .or('storage_path.ilike.%.heic,storage_path.ilike.%.heif')
    
    if (error) {
      console.error('Error fetching photos:', error)
      return
    }
    
    if (!photos || photos.length === 0) {
      console.log('No HEIC photos found')
      return
    }
    
    console.log(`Found ${photos.length} HEIC photos to convert`)
    
    for (const photo of photos) {
      try {
        console.log(`Converting ${photo.storage_path}...`)
        
        // Download the HEIC file from Supabase storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('photos')
          .download(photo.storage_path)
        
        if (downloadError) {
          console.error(`Error downloading ${photo.storage_path}:`, downloadError)
          continue
        }
        
        // Convert HEIC to buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Convert HEIC to JPEG
        const jpegBuffer = await convert({
          buffer: buffer,
          format: 'JPEG',
          quality: 0.9
        })
        
        // Optimize with sharp
        const optimizedBuffer = await sharp(jpegBuffer)
          .jpeg({ quality: 85, progressive: true })
          .resize(2000, 2000, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .toBuffer()
        
        // Create new filename (replace .heic/.heif with .jpg)
        const newPath = photo.storage_path
          .replace(/\.heic$/i, '.jpg')
          .replace(/\.heif$/i, '.jpg')
        
        // Upload the converted file
        const { error: uploadError } = await supabase
          .storage
          .from('photos')
          .upload(newPath, optimizedBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`Error uploading converted file:`, uploadError)
          continue
        }
        
        // Get the public URL for the new file
        const { data: { publicUrl } } = supabase
          .storage
          .from('photos')
          .getPublicUrl(newPath)
        
        // Update the database record
        const { error: updateError } = await supabase
          .from('photos')
          .update({
            storage_path: newPath,
            public_url: publicUrl
          })
          .eq('id', photo.id)
        
        if (updateError) {
          console.error(`Error updating database:`, updateError)
          continue
        }
        
        // Delete the old HEIC file (optional - comment out if you want to keep originals)
        const { error: deleteError } = await supabase
          .storage
          .from('photos')
          .remove([photo.storage_path])
        
        if (deleteError) {
          console.error(`Warning: Could not delete original file ${photo.storage_path}`)
        }
        
        console.log(`✓ Successfully converted ${photo.storage_path} to ${newPath}`)
        
      } catch (error) {
        console.error(`Error processing photo ${photo.id}:`, error)
      }
    }
    
    console.log('Conversion complete!')
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Run the conversion
convertHeicPhotos()