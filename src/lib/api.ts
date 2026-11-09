import type { Room } from '../data/types'

export type CloudStatus = {
  ok: boolean
  backend: 'vercel-kv' | 'memory' | 'offline'
  durable: boolean
}

export type PublishInviteResult = {
  code: string
  shortCode: string
  durable: boolean
}

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchCloudStatus(): Promise<CloudStatus> {
  try {
    const res = await fetch('/api/status', { method: 'GET' })
    if (!res.ok) return { ok: false, backend: 'offline', durable: false }
    const data = await parseJson<{ ok?: boolean; backend?: string; durable?: boolean }>(res)
    if (!data?.ok) return { ok: false, backend: 'offline', durable: false }
    return {
      ok: true,
      backend: data.backend === 'vercel-kv' ? 'vercel-kv' : 'memory',
      durable: Boolean(data.durable),
    }
  } catch {
    return { ok: false, backend: 'offline', durable: false }
  }
}

export async function publishInvite(
  room: Room,
  ownerCode?: string,
): Promise<PublishInviteResult | null> {
  try {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, ownerCode }),
    })
    if (!res.ok) return null
    const data = await parseJson<PublishInviteResult>(res)
    if (!data?.code || !data.shortCode) return null
    return data
  } catch {
    return null
  }
}

export async function fetchInviteRoom(code: string): Promise<Room | null> {
  try {
    const clean = code.trim().replace(/^RR2\./i, '')
    const res = await fetch(`/api/invite?code=${encodeURIComponent(clean)}`)
    if (!res.ok) return null
    const data = await parseJson<{ room?: Room }>(res)
    if (!data?.room || typeof data.room !== 'object') return null
    return data.room as Room
  } catch {
    return null
  }
}

export async function fetchPlayerRooms(code: string): Promise<{
  rooms: Room[]
  displayName: string
  updatedAt: number
  durable: boolean
} | null> {
  try {
    const res = await fetch(`/api/player?code=${encodeURIComponent(code)}`)
    if (!res.ok) return null
    const data = await parseJson<{
      rooms?: Room[]
      displayName?: string
      updatedAt?: number
      durable?: boolean
    }>(res)
    if (!data) return null
    return {
      rooms: Array.isArray(data.rooms) ? data.rooms : [],
      displayName: data.displayName || 'You',
      updatedAt: data.updatedAt || 0,
      durable: Boolean(data.durable),
    }
  } catch {
    return null
  }
}

export async function savePlayerRooms(
  code: string,
  rooms: Room[],
  displayName: string,
): Promise<{ ok: boolean; durable: boolean }> {
  try {
    const res = await fetch('/api/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, rooms, displayName }),
    })
    if (!res.ok) return { ok: false, durable: false }
    const data = await parseJson<{ ok?: boolean; durable?: boolean }>(res)
    return { ok: Boolean(data?.ok), durable: Boolean(data?.durable) }
  } catch {
    return { ok: false, durable: false }
  }
}
