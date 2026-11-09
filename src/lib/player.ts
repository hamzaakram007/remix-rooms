const PLAYER_KEY = 'remix-rooms:player:v3'
const DISPLAY_KEY = 'remix-rooms:display-name:v3'

const WORDS = [
  'CORAL',
  'SUNNY',
  'FOAM',
  'PINE',
  'ZEST',
  'TEAL',
  'CLOUD',
  'STAR',
  'COZY',
  'GLOW',
  'WAVE',
  'LEAF',
]

function randomSuffix(len = 4) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]!
  }
  return out
}

export function makePlayerCode() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]!
  return `${word}-${randomSuffix(4)}`
}

export function normalizePlayerCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidPlayerCode(raw: string) {
  return /^[A-Z]{3,8}-[A-Z0-9]{3,6}$/.test(normalizePlayerCode(raw))
}

export function loadPlayerCode(): string {
  try {
    const existing = localStorage.getItem(PLAYER_KEY)
    if (existing && isValidPlayerCode(existing)) return normalizePlayerCode(existing)
  } catch {
    /* ignore */
  }
  const code = makePlayerCode()
  try {
    localStorage.setItem(PLAYER_KEY, code)
  } catch {
    /* ignore */
  }
  return code
}

export function savePlayerCode(code: string) {
  const normalized = normalizePlayerCode(code)
  if (!isValidPlayerCode(normalized)) return false
  try {
    localStorage.setItem(PLAYER_KEY, normalized)
    return true
  } catch {
    return false
  }
}

export function loadDisplayName() {
  try {
    return localStorage.getItem(DISPLAY_KEY) || 'You'
  } catch {
    return 'You'
  }
}

export function saveDisplayName(name: string) {
  try {
    localStorage.setItem(DISPLAY_KEY, name.slice(0, 32) || 'You')
  } catch {
    /* ignore */
  }
}
