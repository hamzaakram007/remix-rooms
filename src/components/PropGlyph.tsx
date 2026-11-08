import type { PropKind } from '../data/types'

type Props = {
  kind: PropKind
  color: string
  scale?: number
}

export function PropGlyph({ kind, color, scale = 1 }: Props) {
  const s = 72 * scale
  return (
    <svg width={s} height={s} viewBox="0 0 72 72" aria-hidden className="prop-glyph">
      {render(kind, color)}
    </svg>
  )
}

function render(kind: PropKind, c: string) {
  switch (kind) {
    case 'sofa':
      return (
        <>
          <rect x="8" y="28" width="56" height="28" rx="10" fill={c} />
          <rect x="12" y="22" width="20" height="14" rx="6" fill={c} opacity={0.85} />
          <rect x="40" y="22" width="20" height="14" rx="6" fill={c} opacity={0.85} />
          <rect x="14" y="34" width="18" height="12" rx="4" fill="#fff" opacity={0.25} />
          <rect x="40" y="34" width="18" height="12" rx="4" fill="#fff" opacity={0.25} />
          <rect x="12" y="54" width="8" height="8" rx="2" fill="#2a1a10" />
          <rect x="52" y="54" width="8" height="8" rx="2" fill="#2a1a10" />
        </>
      )
    case 'plant':
      return (
        <>
          <ellipse cx="36" cy="28" rx="16" ry="18" fill={c} />
          <ellipse cx="24" cy="34" rx="10" ry="12" fill={c} opacity={0.85} />
          <ellipse cx="48" cy="34" rx="10" ry="12" fill={c} opacity={0.85} />
          <rect x="30" y="44" width="12" height="8" fill="#8b5a2b" />
          <path d="M22 52 h28 l-4 14 H26 z" fill="#c4793a" />
        </>
      )
    case 'lamp':
      return (
        <>
          <path d="M22 18 h28 l-6 22 H28 z" fill={c} />
          <rect x="34" y="40" width="4" height="18" fill="#ddd" />
          <ellipse cx="36" cy="60" rx="12" ry="4" fill="#2a1a10" opacity={0.5} />
          <circle cx="36" cy="28" r="6" fill="#fff" opacity={0.55} />
        </>
      )
    case 'table':
      return (
        <>
          <ellipse cx="36" cy="34" rx="26" ry="10" fill={c} />
          <rect x="18" y="34" width="4" height="22" fill="#5c4033" />
          <rect x="50" y="34" width="4" height="22" fill="#5c4033" />
          <ellipse cx="36" cy="58" rx="20" ry="4" fill="#000" opacity={0.15} />
        </>
      )
    case 'art':
      return (
        <>
          <rect x="12" y="14" width="48" height="44" rx="4" fill="#f5f0e8" stroke="#2a1a10" strokeWidth="3" />
          <circle cx="28" cy="30" r="8" fill={c} />
          <path d="M14 48 L30 36 L42 44 L58 28 V54 H14 Z" fill={c} opacity={0.7} />
        </>
      )
    case 'rug':
      return (
        <>
          <ellipse cx="36" cy="40" rx="30" ry="16" fill={c} />
          <ellipse cx="36" cy="40" rx="22" ry="10" fill="#fff" opacity={0.2} />
          <ellipse cx="36" cy="40" rx="12" ry="5" fill={c} opacity={0.8} />
        </>
      )
    case 'window':
      return (
        <>
          <rect x="10" y="12" width="52" height="48" rx="4" fill="#2a1a10" />
          <rect x="14" y="16" width="20" height="18" fill={c} />
          <rect x="38" y="16" width="20" height="18" fill={c} />
          <rect x="14" y="38" width="20" height="18" fill={c} opacity={0.9} />
          <rect x="38" y="38" width="20" height="18" fill={c} opacity={0.9} />
          <circle cx="48" cy="24" r="4" fill="#ffd24a" opacity={0.7} />
        </>
      )
    case 'bed':
      return (
        <>
          <rect x="8" y="30" width="56" height="26" rx="8" fill={c} />
          <rect x="12" y="22" width="22" height="14" rx="6" fill="#f5f0e8" />
          <rect x="10" y="36" width="52" height="12" rx="4" fill="#fff" opacity={0.3} />
          <rect x="12" y="54" width="8" height="8" rx="2" fill="#2a1a10" />
          <rect x="52" y="54" width="8" height="8" rx="2" fill="#2a1a10" />
        </>
      )
    case 'desk':
      return (
        <>
          <rect x="8" y="28" width="56" height="8" rx="2" fill={c} />
          <rect x="12" y="36" width="6" height="22" fill="#5c4033" />
          <rect x="54" y="36" width="6" height="22" fill="#5c4033" />
          <rect x="22" y="18" width="28" height="12" rx="2" fill="#0b2438" />
          <rect x="26" y="20" width="20" height="8" rx="1" fill="#7dffc3" opacity={0.7} />
        </>
      )
    case 'shelf':
      return (
        <>
          <rect x="14" y="18" width="44" height="6" rx="1" fill={c} />
          <rect x="14" y="34" width="44" height="6" rx="1" fill={c} />
          <rect x="14" y="50" width="44" height="6" rx="1" fill={c} />
          <rect x="18" y="10" width="8" height="8" fill="#e85d4c" />
          <rect x="30" y="26" width="10" height="8" fill="#7dffc3" />
          <rect x="46" y="42" width="8" height="8" fill="#ffd24a" />
        </>
      )
    case 'beanbag':
      return (
        <>
          <ellipse cx="36" cy="42" rx="26" ry="18" fill={c} />
          <ellipse cx="36" cy="36" rx="18" ry="12" fill={c} opacity={0.85} />
          <ellipse cx="30" cy="34" rx="6" ry="4" fill="#fff" opacity={0.25} />
        </>
      )
    case 'poster':
      return (
        <>
          <rect x="16" y="10" width="40" height="52" rx="3" fill={c} />
          <rect x="22" y="18" width="28" height="8" rx="2" fill="#fff" opacity={0.85} />
          <rect x="22" y="32" width="28" height="20" rx="2" fill="#fff" opacity={0.35} />
          <circle cx="36" cy="42" r="6" fill="#ff7a1a" />
        </>
      )
    case 'cushion':
      return (
        <>
          <ellipse cx="36" cy="40" rx="24" ry="16" fill={c} />
          <ellipse cx="36" cy="36" rx="16" ry="10" fill="#fff" opacity={0.22} />
          <path d="M20 40 Q36 48 52 40" stroke="#000" strokeOpacity={0.12} fill="none" strokeWidth="3" />
        </>
      )
    case 'star':
      return (
        <>
          <polygon
            points="36,8 42,26 62,26 46,38 52,56 36,45 20,56 26,38 10,26 30,26"
            fill={c}
          />
          <circle cx="36" cy="32" r="5" fill="#fff" opacity={0.35} />
        </>
      )
    case 'mirror':
      return (
        <>
          <ellipse cx="36" cy="36" rx="18" ry="26" fill="#2a1a10" />
          <ellipse cx="36" cy="36" rx="14" ry="22" fill={c} opacity={0.85} />
          <ellipse cx="30" cy="28" rx="5" ry="8" fill="#fff" opacity={0.35} />
        </>
      )
    case 'toy':
      return (
        <>
          <circle cx="36" cy="34" r="16" fill={c} />
          <circle cx="30" cy="30" r="3" fill="#0b2438" />
          <circle cx="42" cy="30" r="3" fill="#0b2438" />
          <path d="M28 40 Q36 46 44 40" stroke="#0b2438" strokeWidth="2.5" fill="none" />
          <circle cx="18" cy="22" r="6" fill={c} opacity={0.9} />
          <circle cx="54" cy="22" r="6" fill={c} opacity={0.9} />
        </>
      )
  }
}

export const PROP_LABELS: Record<PropKind, string> = {
  sofa: 'Sofa',
  plant: 'Plant',
  lamp: 'Lamp',
  table: 'Table',
  art: 'Art',
  rug: 'Rug',
  window: 'Window',
  bed: 'Bed',
  desk: 'Desk',
  shelf: 'Shelf',
  beanbag: 'Beanbag',
  poster: 'Poster',
  cushion: 'Cushion',
  star: 'Star',
  mirror: 'Mirror',
  toy: 'Toy',
}
