import type { PropKind, Room, RoomProp } from '../data/types'
import { fetchInviteRoom } from './api'
import { uid } from './id'

/** Compact wire format for shareable room payloads (URL / invite code). */
type CompactShare = {
  v: 1
  n: string
  a: string
  t: string
  w: string
  f: string
  c: string
  p: [PropKind, number, number, number, string][]
  l: string[]
  pid?: string
  pn?: string
  pa?: string
  ch?: string
  rb?: string
  id?: string
}

export const EMBEDDED_PREFIX = 'RR1.'
export const CLOUD_PREFIX = 'RR2.'

export function roomToCompact(room: Room): CompactShare {
  return {
    v: 1,
    n: room.name,
    a: room.author,
    t: room.templateId,
    w: room.wallColor,
    f: room.floorColor,
    c: room.accentColor,
    p: room.props.map((p) => [p.kind, round1(p.x), round1(p.y), round2(p.scale), p.color]),
    l: room.lineage.slice(0, 12),
    id: room.id,
    ...(room.parentId ? { pid: room.parentId } : {}),
    ...(room.parentName ? { pn: room.parentName } : {}),
    ...(room.parentAuthor ? { pa: room.parentAuthor } : {}),
    ...(room.challengeId ? { ch: room.challengeId } : {}),
    ...(room.ribbon ? { rb: room.ribbon } : {}),
  }
}

export function compactToRoom(data: CompactShare, overrides?: Partial<Room>): Room {
  const props: RoomProp[] = data.p.map(([kind, x, y, scale, color]) => ({
    id: uid('p'),
    kind,
    x,
    y,
    scale,
    color,
  }))
  return {
    id: data.id || uid('room'),
    name: data.n,
    author: data.a,
    authorKind: 'friend',
    templateId: data.t,
    wallColor: data.w,
    floorColor: data.f,
    accentColor: data.c,
    props,
    lineage: data.l?.length ? data.l : ['Shared room'],
    parentId: data.pid,
    parentName: data.pn,
    parentAuthor: data.pa,
    challengeId: data.ch,
    ribbon: data.rb,
    shared: true,
    createdAt: Date.now(),
    inviteImported: true,
    ...overrides,
  }
}

export function encodeInvite(room: Room): string {
  const json = JSON.stringify(roomToCompact(room))
  return EMBEDDED_PREFIX + toBase64Url(json)
}

export function encodeCloudInvite(shortCode: string): string {
  return CLOUD_PREFIX + shortCode.replace(/^RR2\./i, '').toUpperCase()
}

export function isCloudInviteCode(raw: string): boolean {
  const trimmed = raw.trim()
  if (/^RR2\./i.test(trimmed)) return true
  // Bare short codes (6 alnum) — not embedded base64
  const bare = trimmed.replace(/^#?invite=/i, '')
  return /^[A-HJ-NP-Z0-9]{5,8}$/i.test(bare) && !bare.includes('.')
}

export function decodeInvite(raw: string): Room | null {
  try {
    const trimmed = raw.trim()
    if (/^RR2\./i.test(trimmed) || isCloudInviteCode(trimmed)) {
      // Sync decode cannot fetch cloud — caller should use resolveInvite
      return null
    }
    const body = trimmed.startsWith(EMBEDDED_PREFIX)
      ? trimmed.slice(EMBEDDED_PREFIX.length)
      : trimmed.replace(/^#?invite=/i, '')
    if (!body) return null
    const json = fromBase64Url(body)
    const data = JSON.parse(json) as CompactShare
    if (data?.v !== 1 || !Array.isArray(data.p) || !data.t) return null
    return compactToRoom(data)
  } catch {
    return null
  }
}

/** Resolve invite from embedded payload or cloud short code. */
export async function resolveInvite(raw: string): Promise<Room | null> {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Extract from full URLs
  let payload = trimmed
  try {
    if (trimmed.includes('://') || trimmed.includes('#invite=')) {
      const hash = trimmed.includes('#') ? trimmed.slice(trimmed.indexOf('#') + 1) : trimmed
      const params = new URLSearchParams(hash.includes('=') ? hash : `invite=${hash}`)
      const invite = params.get('invite')
      if (invite) payload = invite
    }
  } catch {
    /* use raw */
  }

  if (/^RR2\./i.test(payload) || isCloudInviteCode(payload)) {
    const code = payload.replace(/^RR2\./i, '').replace(/^#?invite=/i, '')
    const room = await fetchInviteRoom(code)
    if (!room) return null
    return {
      ...room,
      authorKind: room.authorKind === 'you' ? 'friend' : room.authorKind || 'friend',
      shared: true,
      inviteImported: true,
    }
  }

  return decodeInvite(payload.startsWith(EMBEDDED_PREFIX) ? payload : mayAddPrefix(payload))
}

function mayAddPrefix(body: string) {
  if (body.startsWith(EMBEDDED_PREFIX) || body.startsWith(CLOUD_PREFIX)) return body
  // Looks like base64url → treat as embedded
  if (/^[A-Za-z0-9_-]+$/.test(body) && body.length > 20) return EMBEDDED_PREFIX + body
  return body
}

export function buildInviteUrl(
  invitePayload: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const bare = invitePayload
    .replace(new RegExp(`^(${EMBEDDED_PREFIX}|${CLOUD_PREFIX})`, 'i'), '')
  const base = origin || ''
  return `${base}${base.endsWith('/') ? '' : '/'}#invite=${bare}`
}

export function buildInviteUrlFromRoom(
  room: Room,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const code = encodeInvite(room)
  return buildInviteUrl(code, origin)
}

export function parseInviteFromLocation(
  hash = typeof window !== 'undefined' ? window.location.hash : '',
): string | null {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  if (!h) return null
  const params = new URLSearchParams(h.includes('=') ? h : `invite=${h}`)
  return params.get('invite')
}

export function clearInviteHash() {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}

export function shortInviteLabel(code: string): string {
  if (code.startsWith(CLOUD_PREFIX) || isCloudInviteCode(code)) {
    const body = code.replace(/^RR2\./i, '')
    return `RR2 · ${body}`
  }
  const body = code.startsWith(EMBEDDED_PREFIX) ? code.slice(EMBEDDED_PREFIX.length) : code
  if (body.length <= 10) return `RR · ${body}`
  return `RR · ${body.slice(0, 4)}…${body.slice(-4)}`
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}
