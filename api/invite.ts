import { getStore, makeShortInviteCode, normalizeCode, storeStatus } from '../lib/server/store'

export const config = { runtime: 'edge' }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

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
    const record = await store.getInvite(code)
    if (!record) {
      return Response.json({ error: 'Invite not found' }, { status: 404, headers: cors })
    }
    return Response.json(
      {
        code: record.code,
        room: record.room,
        createdAt: record.createdAt,
        durable: store.durable,
      },
      { headers: cors },
    )
  }

  if (req.method === 'POST') {
    let body: { room?: Record<string, unknown>; ownerCode?: string; code?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: cors })
    }
    if (!body.room || typeof body.room !== 'object') {
      return Response.json({ error: 'Missing room' }, { status: 400, headers: cors })
    }

    let code = body.code ? normalizeCode(body.code) : makeShortInviteCode()
    // Avoid rare collisions
    for (let i = 0; i < 4; i++) {
      const existing = await store.getInvite(code)
      if (!existing) break
      code = makeShortInviteCode()
    }

    const record = {
      code,
      room: body.room,
      createdAt: Date.now(),
      ownerCode: body.ownerCode ? normalizeCode(body.ownerCode) : undefined,
    }
    await store.putInvite(record)

    return Response.json(
      {
        code: `RR2.${code}`,
        shortCode: code,
        durable: store.durable,
        ...storeStatus(),
      },
      { headers: cors },
    )
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
}
