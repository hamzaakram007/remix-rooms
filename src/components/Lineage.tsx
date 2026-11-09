import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  room: Room
  rooms: Room[]
  onOpenParent?: (id: string) => void
  onRemix: () => void
  onBack: () => void
}

export function Lineage({ room, rooms, onOpenParent, onRemix, onBack }: Props) {
  const steps = [...room.lineage, room.name]
  const parent = room.parentId ? rooms.find((r) => r.id === room.parentId) : null

  return (
    <section className="panel lineage">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2>Remix lineage</h2>
          <p>See how this room grew from a template through family remixes.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onRemix}>
          Remix this room
        </button>
      </header>

      <div className="lineage__tree">
        {steps.map((step, i) => {
          const isCurrent = i === steps.length - 1
          const isParentStep = Boolean(parent && i === steps.length - 2)
          return (
            <motion.div
              key={`${step}-${i}`}
              className={`lineage__node ${isCurrent ? 'is-current' : ''} ${isParentStep ? 'is-parent' : ''}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
            >
              <span className="lineage__dot" />
              <div>
                <strong>{step}</strong>
                <span>
                  {i === 0
                    ? 'Template start'
                    : isCurrent
                      ? `You are here · by ${room.author}`
                      : isParentStep && room.parentAuthor
                        ? `Earlier remix · ${room.parentAuthor}`
                        : 'Earlier remix'}
                </span>
                {isParentStep && parent && onOpenParent && (
                  <button type="button" className="linkish lineage__open" onClick={() => onOpenParent(parent.id)}>
                    Open parent room
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="lineage__stage">
        <RoomStage room={room} />
      </div>
    </section>
  )
}
