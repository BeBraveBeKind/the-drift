import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  const results: any = {}
  
  // 1. Check environment variables
  results.envVars = {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    urlPrefix: supabaseUrl?.substring(0, 30),
    keyPrefix: supabaseServiceKey?.substring(0, 20)
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      results
    }, { status: 500 })
  }

  try {
    // 2. Create Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    results.clientCreated = true

    // 3. Test bucket access
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
      results.listBuckets = {
        success: !bucketsError,
        error: bucketsError?.message,
        bucketCount: buckets?.length,
        bucketNames: buckets?.map(b => b.name)
      }
    } catch (e) {
      results.listBuckets = { error: e instanceof Error ? e.message : 'Failed' }
    }

    // 4. Test specific bucket
    try {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('board-photos')
        .list('', { limit: 1 })
      
      results.accessBucket = {
        success: !listError,
        error: listError?.message,
        canAccess: !!files
      }
    } catch (e) {
      results.accessBucket = { error: e instanceof Error ? e.message : 'Failed' }
    }

    // 5. Test creating a test file
    try {
      const testContent = new Blob(['test'], { type: 'text/plain' })
      const testPath = `test-${Date.now()}.txt`
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('board-photos')
        .upload(testPath, testContent)
      
      results.testUpload = {
        success: !uploadError,
        error: uploadError?.message,
        path: testPath
      }

      // Clean up test file if successful
      if (!uploadError) {
        await supabaseAdmin.storage
          .from('board-photos')
          .remove([testPath])
      }
    } catch (e) {
      results.testUpload = { error: e instanceof Error ? e.message : 'Failed' }
    }

    // 6. Test database access
    try {
      const { data, error } = await supabaseAdmin
        .from('towns')
        .select('id')
        .limit(1)
      
      results.databaseAccess = {
        success: !error,
        error: error?.message,
        hasData: !!data
      }
    } catch (e) {
      results.databaseAccess = { error: e instanceof Error ? e.message : 'Failed' }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        canUpload: results.accessBucket?.success && results.testUpload?.success,
        issues: Object.entries(results)
          .filter(([_, value]: [string, any]) => value?.error)
          .map(([key]) => key)
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to run tests',
      message: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 })
  }
}