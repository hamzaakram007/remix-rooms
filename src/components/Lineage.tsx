import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  room: Room
  onBack: () => void
}

export function Lineage({ room, onBack }: Props) {
  const steps = [...room.lineage, room.name]

  return (
    <section className="panel lineage">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Back to editor
        </button>
        <div>
          <h2>Remix lineage</h2>
          <p>One-tap ancestry — see how this room grew from templates and remixes.</p>
        </div>
      </header>

      <div className="lineage__tree">
        {steps.map((step, i) => (
          <motion.div
            key={`${step}-${i}`}
            className={`lineage__node ${i === steps.length - 1 ? 'is-current' : ''}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="lineage__dot" />
            <div>
              <strong>{step}</strong>
              <span>
                {i === 0 ? 'Template start' : i === steps.length - 1 ? 'You are here' : 'Earlier remix'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="lineage__stage">
        <RoomStage room={room} />
      </div>
    </section>
  )
}
