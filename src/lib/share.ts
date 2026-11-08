import type { PropKind, Room, RoomProp } from '../data/types'
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
  ch?: string
  rb?: string
}

const INVITE_PREFIX = 'RR1.'

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
    id: uid('room'),
    name: data.n,
    author: data.a,
    authorKind: 'friend',
    templateId: data.t,
    wallColor: data.w,
    floorColor: data.f,
    accentColor: data.c,
    props,
    lineage: data.l?.length ? data.l : ['Shared room'],
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
  return INVITE_PREFIX + toBase64Url(json)
}

export function decodeInvite(raw: string): Room | null {
  try {
    const trimmed = raw.trim()
    const body = trimmed.startsWith(INVITE_PREFIX)
      ? trimmed.slice(INVITE_PREFIX.length)
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

export function buildInviteUrl(room: Room, origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  const code = encodeInvite(room)
  const base = origin || ''
  return `${base}${base.endsWith('/') ? '' : '/'}#invite=${code.slice(INVITE_PREFIX.length)}`
}

export function parseInviteFromLocation(hash = typeof window !== 'undefined' ? window.location.hash : ''): Room | null {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  if (!h) return null
  const params = new URLSearchParams(h.includes('=') ? h : `invite=${h}`)
  const invite = params.get('invite')
  if (!invite) return null
  return decodeInvite(invite.startsWith(INVITE_PREFIX) ? invite : INVITE_PREFIX + invite)
}

export function clearInviteHash() {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}

export function shortInviteLabel(code: string): string {
  const body = code.startsWith(INVITE_PREFIX) ? code.slice(INVITE_PREFIX.length) : code
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
