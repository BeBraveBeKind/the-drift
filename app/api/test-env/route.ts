import { NextResponse } from 'next/server'

export async function GET() {
  // Check which environment variables are set (without exposing values)
  const status = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }

  // If service key is missing, provide helpful message
  if (!status.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      ...status,
      error: 'SUPABASE_SERVICE_ROLE_KEY is not configured. Add it in Netlify Dashboard → Site Settings → Environment Variables',
      instructions: [
        '1. Go to Netlify Dashboard',
        '2. Site Settings → Environment Variables', 
        '3. Add SUPABASE_SERVICE_ROLE_KEY',
        '4. Redeploy the site',
        '5. The service role key is in Supabase Dashboard → Settings → API → service_role key'
      ]
    }, { status: 500 })
  }

  return NextResponse.json({
    ...status,
    message: 'All environment variables are configured correctly!'
  })
}