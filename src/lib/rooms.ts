import { TEMPLATES } from '../data/templates'
import type { PropKind, Room, RoomProp, Template } from '../data/types'
import { uid } from './id'

const PROP_PALETTE = [
  '#ff7a1a',
  '#e85d4c',
  '#ffd24a',
  '#7dffc3',
  '#6b7fd7',
  '#2f9e6d',
  '#8b5a2b',
  '#0b2438',
  '#fff1c2',
  '#87ceeb',
  '#ff5e3a',
  '#9ad7ff',
]

export const WALL_SWATCHES = [
  '#1e4d5c',
  '#f26b3a',
  '#14233a',
  '#0f6b5c',
  '#0d3b4c',
  '#3d6e8c',
  '#c45c26',
  '#245b6b',
  '#f4a261',
  '#0b2438',
]

export const FLOOR_SWATCHES = [
  '#c4793a',
  '#3d2b1f',
  '#4a3728',
  '#d4a574',
  '#1a1220',
  '#1f1a18',
  '#d9c3a5',
  '#5c4033',
  '#6b5344',
  '#6b4f3a',
]

export const STAMPABLE: PropKind[] = [
  'plant',
  'lamp',
  'poster',
  'art',
  'beanbag',
  'rug',
  'cushion',
  'star',
  'mirror',
  'toy',
]

export function templateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function roomFromTemplate(template: Template, author = 'You'): Room {
  return {
    id: uid('room'),
    name: `My ${template.name}`,
    author,
    authorKind: 'you',
    templateId: template.id,
    wallColor: template.wallColor,
    floorColor: template.floorColor,
    accentColor: template.accentColor,
    props: template.props.map((p) => ({ ...p, id: uid('p') })),
    lineage: [template.name],
    shared: false,
    createdAt: Date.now(),
  }
}

export function remixOf(source: Room, author = 'You'): Room {
  return {
    ...structuredClone(source),
    id: uid('room'),
    name: `Remix · ${source.name}`,
    author,
    authorKind: 'you',
    parentId: source.id,
    parentName: source.name,
    parentAuthor: source.author,
    lineage: [...source.lineage, source.name],
    shared: false,
    createdAt: Date.now(),
    ribbon: undefined,
    challengeId: undefined,
    inviteImported: false,
  }
}

export function duplicateRoom(source: Room, author = 'You'): Room {
  return {
    ...structuredClone(source),
    id: uid('room'),
    name: `${source.name} (copy)`,
    author,
    authorKind: 'you',
    shared: false,
    createdAt: Date.now(),
    inviteImported: false,
  }
}

export function nextColor(current: string): string {
  const i = PROP_PALETTE.indexOf(current)
  return PROP_PALETTE[(i + 1) % PROP_PALETTE.length]!
}

export function stampProp(kind: PropKind, x = 50, y = 55): RoomProp {
  return {
    id: uid('p'),
    kind,
    x,
    y,
    scale: 0.9 + Math.random() * 0.25,
    color: PROP_PALETTE[Math.floor(Math.random() * PROP_PALETTE.length)]!,
  }
}

export function cloneProp(prop: RoomProp): RoomProp {
  return {
    ...prop,
    id: uid('p'),
    x: Math.min(94, prop.x + 4),
    y: Math.min(90, prop.y + 3),
  }
}

const STORAGE_KEY = 'remix-rooms:v2'
const LEGACY_KEY = 'remix-rooms:v1'

export function persistRooms(rooms: Room[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  } catch {
    /* ignore quota */
  }
}

export function loadRooms(): Room[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Room[]
  } catch {
    return null
  }
}

export function snapshotRoom(room: Room): Room {
  return structuredClone(room)
}
