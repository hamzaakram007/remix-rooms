import { getStore, normalizeCode, storeStatus } from '../lib/server/store'

export const config = { runtime: 'edge' }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const CODE_RE = /^[A-Z]{3,8}-[A-Z0-9]{3,6}$/

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const store = getStore()
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const code = url.searchParams.get('code')
    if (!code) {
      return Response.json({ error: 'Missing code' }, { status: 400, headers: cors })
    }
    const normalized = normalizeCode(code)
    if (!CODE_RE.test(normalized)) {
      return Response.json({ error: 'Invalid player code' }, { status: 400, headers: cors })
    }
    const record = await store.getPlayer(normalized)
    if (!record) {
      return Response.json(
        { code: normalized, rooms: [], displayName: '', updatedAt: 0, durable: store.durable },
        { headers: cors },
      )
    }
    return Response.json({ ...record, durable: store.durable }, { headers: cors })
  }

  if (req.method === 'PUT') {
    let body: {
      code?: string
      displayName?: string
      rooms?: Record<string, unknown>[]
    }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: cors })
    }

    const code = body.code ? normalizeCode(body.code) : ''
    if (!CODE_RE.test(code)) {
      return Response.json({ error: 'Invalid player code' }, { status: 400, headers: cors })
    }
    if (!Array.isArray(body.rooms)) {
      return Response.json({ error: 'Missing rooms' }, { status: 400, headers: cors })
    }

    // Cap payload size for kid rooms
    const rooms = body.rooms.slice(0, 40)
    const record = {
      code,
      displayName: String(body.displayName ?? 'You').slice(0, 32),
      rooms,
      updatedAt: Date.now(),
    }
    await store.putPlayer(record)

    return Response.json(
      { ok: true, code, updatedAt: record.updatedAt, durable: store.durable, ...storeStatus() },
      { headers: cors },
    )
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
}
