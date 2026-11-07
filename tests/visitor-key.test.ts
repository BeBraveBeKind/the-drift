import test from 'node:test'
import assert from 'node:assert'
import { visitorKey, clientIp, centralDay, isUuid, flagOutcome } from '../lib/visitor-key'

test('visitorKey is stable and hides the IP', () => {
  const k = visitorKey('203.0.113.9', 'UA-1', 'salt', '2026-11-02')
  assert.strictEqual(k, visitorKey('203.0.113.9', 'UA-1', 'salt', '2026-11-02'))
  assert.match(k, /^[0-9a-f]{64}$/)
  assert.ok(!k.includes('203.0.113.9'))
})
test('visitorKey differs by user agent', () => {
  assert.notStrictEqual(visitorKey('203.0.113.9', 'UA-1', 's', '2026-11-02'), visitorKey('203.0.113.9', 'UA-2', 's', '2026-11-02'))
})
test('visitorKey rotates daily', () => {
  assert.notStrictEqual(visitorKey('203.0.113.9', 'UA-1', 's', '2026-11-02'), visitorKey('203.0.113.9', 'UA-1', 's', '2026-11-03'))
})
test('clientIp prefers the Netlify header', () => {
  const h = new Headers({ 'x-nf-client-connection-ip': '198.51.100.7', 'x-forwarded-for': '10.0.0.1, 10.0.0.2' })
  assert.strictEqual(clientIp(h), '198.51.100.7')
  assert.strictEqual(clientIp(new Headers({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' })), '10.0.0.1')
  assert.strictEqual(clientIp(new Headers()), 'unknown')
})
test('clientIp trims whitespace and treats empty values as absent', () => {
  assert.strictEqual(clientIp(new Headers({ 'x-forwarded-for': '  10.0.0.1 , 10.0.0.2' })), '10.0.0.1')
  assert.strictEqual(clientIp(new Headers({ 'x-forwarded-for': '   ' })), 'unknown')
})
test('centralDay uses Chicago time', () => {
  assert.strictEqual(centralDay(new Date('2026-11-03T04:30:00Z')), '2026-11-02')
})
test('isUuid and flagOutcome', () => {
  assert.ok(isUuid('6f1c2a7e-3b9d-4c1e-9a2f-0d8e7b6c5a41'))
  assert.ok(!isUuid('1 or 1=1'))
  assert.strictEqual(flagOutcome(null), 'count')
  assert.strictEqual(flagOutcome({ code: '23505' }), 'duplicate')
  assert.strictEqual(flagOutcome({ code: '42501' }), 'error')
})
test('isUuid accepts any canonical UUID case-insensitively and rejects non-strings', () => {
  assert.ok(isUuid('6F1C2A7E-3B9D-1C1E-9A2F-0D8E7B6C5A41'))
  assert.ok(!isUuid(42))
  assert.ok(!isUuid(null))
})
