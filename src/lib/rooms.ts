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
]

export const WALL_SWATCHES = [
  '#1e4d5c',
  '#f26b3a',
  '#14233a',
  '#0f6b5c',
  '#2a1840',
  '#f4a261',
  '#0b2438',
  '#3d5a80',
]

export const FLOOR_SWATCHES = [
  '#c4793a',
  '#3d2b1f',
  '#4a3728',
  '#d4a574',
  '#1a1220',
  '#6b4f3a',
  '#8b6914',
  '#5c4033',
]

export const STAMPABLE: PropKind[] = [
  'plant',
  'lamp',
  'poster',
  'art',
  'beanbag',
  'rug',
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
    lineage: [...source.lineage, source.name],
    shared: false,
    createdAt: Date.now(),
    ribbon: undefined,
  }
}

export function nextColor(current: string): string {
  const i = PROP_PALETTE.indexOf(current)
  return PROP_PALETTE[(i + 1) % PROP_PALETTE.length]
}

export function stampProp(kind: PropKind, x = 50, y = 55): RoomProp {
  return {
    id: uid('p'),
    kind,
    x,
    y,
    scale: 0.9 + Math.random() * 0.25,
    color: PROP_PALETTE[Math.floor(Math.random() * PROP_PALETTE.length)],
  }
}

export function persistRooms(rooms: Room[]) {
  try {
    localStorage.setItem('remix-rooms:v1', JSON.stringify(rooms))
  } catch {
    /* ignore quota */
  }
}

export function loadRooms(): Room[] | null {
  try {
    const raw = localStorage.getItem('remix-rooms:v1')
    if (!raw) return null
    return JSON.parse(raw) as Room[]
  } catch {
    return null
  }
}
