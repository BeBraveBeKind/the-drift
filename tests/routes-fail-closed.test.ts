import test from 'node:test'
import assert from 'node:assert'
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon'
delete process.env.SUPABASE_SERVICE_ROLE_KEY
process.env.FLAG_SALT = 'test-salt'

const VALID_ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'

function post(path: string, body: string) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'test-agent' },
    body,
  })
}

type Handler = (request: NextRequest) => Promise<Response>

// Add further routes here; each entry is exercised by every test below.
async function routes(): Promise<Array<{ name: string; path: string; field: string; handler: Handler }>> {
  const flag = await import('@/app/api/flag/route')
  return [{ name: 'flag', path: '/api/flag', field: 'photoId', handler: flag.POST }]
}

test('routes return 503 when server config is missing', async () => {
  for (const r of await routes()) {
    const res = await r.handler(post(r.path, JSON.stringify({ [r.field]: VALID_ID })))
    assert.strictEqual(res.status, 503, r.name)
  }
})

test('routes return 400 for an id that is not a UUID', async () => {
  for (const r of await routes()) {
    const res = await r.handler(post(r.path, JSON.stringify({ [r.field]: 'abc' })))
    assert.strictEqual(res.status, 400, r.name)
  }
})

test('routes return 400 for a body that is not valid JSON', async () => {
  for (const r of await routes()) {
    const res = await r.handler(post(r.path, '{not json'))
    assert.strictEqual(res.status, 400, r.name)
  }
})
