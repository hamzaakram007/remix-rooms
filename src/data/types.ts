export type PropKind =
  | 'sofa'
  | 'plant'
  | 'lamp'
  | 'table'
  | 'art'
  | 'rug'
  | 'window'
  | 'bed'
  | 'desk'
  | 'shelf'
  | 'beanbag'
  | 'poster'
  | 'cushion'
  | 'star'
  | 'mirror'
  | 'toy'

export type RoomProp = {
  id: string
  kind: PropKind
  x: number
  y: number
  scale: number
  color: string
}

export type Room = {
  id: string
  name: string
  author: string
  authorKind: 'you' | 'friend' | 'family' | 'sample'
  templateId: string
  wallColor: string
  floorColor: string
  accentColor: string
  props: RoomProp[]
  parentId?: string
  parentName?: string
  parentAuthor?: string
  lineage: string[]
  challengeId?: string
  ribbon?: string
  shared: boolean
  createdAt: number
  /** Marked when imported via invite link/code */
  inviteImported?: boolean
}

export type Template = {
  id: string
  name: string
  blurb: string
  vibe: string
  wallColor: string
  floorColor: string
  accentColor: string
  props: Omit<RoomProp, 'id'>[]
}

export type Challenge = {
  id: string
  title: string
  prompt: string
  ribbon: string
}

export type View =
  | { name: 'home' }
  | { name: 'templates' }
  | { name: 'editor'; roomId: string }
  | { name: 'gallery' }
  | { name: 'share'; roomId: string }
  | { name: 'lineage'; roomId: string }
  | { name: 'invite'; room: Room }
  | { name: 'join' }
