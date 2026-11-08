import { motion } from 'framer-motion'
import type { Room, RoomProp } from '../data/types'
import { PropGlyph } from './PropGlyph'

type Props = {
  room: Pick<Room, 'wallColor' | 'floorColor' | 'accentColor' | 'props' | 'ribbon'>
  selectedId?: string | null
  onSelect?: (id: string) => void
  onPropPointerDown?: (id: string, e: React.PointerEvent) => void
  interactive?: boolean
  compact?: boolean
  className?: string
}

export function RoomStage({
  room,
  selectedId,
  onSelect,
  onPropPointerDown,
  interactive = false,
  compact = false,
  className = '',
}: Props) {
  return (
    <div
      className={`room-stage ${compact ? 'is-compact' : ''} ${className}`}
      style={
        {
          '--wall': room.wallColor,
          '--floor': room.floorColor,
          '--accent': room.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="room-stage__sky" />
      <div className="room-stage__wall">
        <div className="room-stage__trim" />
        <div className="room-stage__glow" />
      </div>
      <div className="room-stage__floor" />
      {room.ribbon && (
        <div className="room-stage__ribbon" aria-label={room.ribbon}>
          {room.ribbon}
        </div>
      )}
      {sortedProps(room.props).map((prop) => (
        <PropNode
          key={prop.id}
          prop={prop}
          selected={selectedId === prop.id}
          interactive={interactive}
          onSelect={onSelect}
          onPropPointerDown={onPropPointerDown}
        />
      ))}
    </div>
  )
}

function sortedProps(props: RoomProp[]) {
  return [...props].sort((a, b) => a.y - b.y || a.x - b.x)
}

function PropNode({
  prop,
  selected,
  interactive,
  onSelect,
  onPropPointerDown,
}: {
  prop: RoomProp
  selected: boolean
  interactive: boolean
  onSelect?: (id: string) => void
  onPropPointerDown?: (id: string, e: React.PointerEvent) => void
}) {
  return (
    <motion.button
      type="button"
      className={`room-prop ${selected ? 'is-selected' : ''} ${interactive ? 'is-interactive' : ''}`}
      style={{ left: `${prop.x}%`, top: `${prop.y}%`, touchAction: interactive ? 'none' : undefined }}
      onClick={(e) => {
        e.stopPropagation()
        if (interactive) onSelect?.(prop.id)
      }}
      onPointerDown={(e) => {
        if (interactive) onPropPointerDown?.(prop.id, e)
      }}
      disabled={!interactive}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      animate={selected ? { y: -4 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      aria-label={prop.kind}
    >
      <PropGlyph kind={prop.kind} color={prop.color} scale={prop.scale} />
    </motion.button>
  )
}
