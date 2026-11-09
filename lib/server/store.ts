/**
 * Durable room/invite store for Remix Rooms.
 * Uses Vercel KV / Upstash Redis when KV_REST_API_* (or UPSTASH_REDIS_REST_*)
 * env vars are set; otherwise an in-memory Map for local/dev.
 */

import { Redis } from '@upstash/redis'

export type StoredRoom = Record<string, unknown>

export type PlayerRecord = {
  code: string
  displayName: string
  rooms: StoredRoom[]
  updatedAt: number
}

export type InviteRecord = {
  code: string
  room: StoredRoom
  createdAt: number
  ownerCode?: string
}

type Store = {
  durable: boolean
  getInvite: (code: string) => Promise<InviteRecord | null>
  putInvite: (record: InviteRecord) => Promise<void>
  getPlayer: (code: string) => Promise<PlayerRecord | null>
  putPlayer: (record: PlayerRecord) => Promise<void>
}

const memoryInvites = new Map<string, InviteRecord>()
const memoryPlayers = new Map<string, PlayerRecord>()

export function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/^RR2\./, '')
}

function redisEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url, token }
}

function getRedis(): Redis | null {
  const env = redisEnv()
  if (!env) return null
  return new Redis({ url: env.url, token: env.token })
}

function memoryStore(): Store {
  return {
    durable: false,
    async getInvite(code) {
      return memoryInvites.get(normalizeCode(code)) ?? null
    },
    async putInvite(record) {
      memoryInvites.set(normalizeCode(record.code), {
        ...record,
        code: normalizeCode(record.code),
      })
    },
    async getPlayer(code) {
      return memoryPlayers.get(normalizeCode(code)) ?? null
    },
    async putPlayer(record) {
      memoryPlayers.set(normalizeCode(record.code), {
        ...record,
        code: normalizeCode(record.code),
      })
    },
  }
}

function redisStore(redis: Redis): Store {
  return {
    durable: true,
    async getInvite(code) {
      const raw = await redis.get<InviteRecord | string>(`rr:invite:${normalizeCode(code)}`)
      if (!raw) return null
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as InviteRecord
        } catch {
          return null
        }
      }
      return raw
    },
    async putInvite(record) {
      const code = normalizeCode(record.code)
      await redis.set(`rr:invite:${code}`, { ...record, code })
    },
    async getPlayer(code) {
      const raw = await redis.get<PlayerRecord | string>(`rr:player:${normalizeCode(code)}`)
      if (!raw) return null
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as PlayerRecord
        } catch {
          return null
        }
      }
      return raw
    },
    async putPlayer(record) {
      const code = normalizeCode(record.code)
      await redis.set(`rr:player:${code}`, { ...record, code })
    },
  }
}

export function getStore(): Store {
  const redis = getRedis()
  return redis ? redisStore(redis) : memoryStore()
}

export function storeStatus() {
  return {
    backend: redisEnv() ? 'vercel-kv' : 'memory',
    durable: Boolean(redisEnv()),
  }
}

export function makeShortInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]!
  }
  return out
}
