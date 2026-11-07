import test from 'node:test'
import assert from 'node:assert'
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon'
const serviceKeyName = 'SUPABASE_SERVICE_ROLE_KEY'
process.env[serviceKeyName] = 'placeholder'

const VALID_ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'

function request() {
  return new NextRequest('http://localhost/api/flag', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'test-agent' },
    body: JSON.stringify({ photoId: VALID_ID }),
  })
}

test('flag route returns 503 when FLAG_SALT is unset', async () => {
  delete process.env.FLAG_SALT
  const { POST } = await import('@/app/api/flag/route')
  assert.strictEqual((await POST(request())).status, 503)
})

test('flag route returns 503 when FLAG_SALT is empty', async () => {
  process.env.FLAG_SALT = ''
  const { POST } = await import('@/app/api/flag/route')
  assert.strictEqual((await POST(request())).status, 503)
})
