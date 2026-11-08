import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  rooms: Room[]
  onOpen: (id: string) => void
  onRemix: (id: string) => void
  onNew: () => void
  onBack: () => void
}

export function Gallery({ rooms, onOpen, onRemix, onNew, onBack }: Props) {
  const yours = rooms.filter((r) => r.authorKind === 'you')
  const circle = rooms.filter((r) => r.authorKind !== 'you' && r.shared)

  return (
    <section className="panel">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Home
        </button>
        <div>
          <h2>Friends & family gallery</h2>
          <p>
            Private circle only — parents approve the metaphor. No open chat, no stranger feed.
            <span className="sample-tag"> Sample rooms included for this MVP</span>
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onNew}>
          New from template
        </button>
      </header>

      <GallerySection title="Your rooms" empty="You haven’t remixed yet — pick a template!">
        {yours.map((room, i) => (
          <GalleryCard
            key={room.id}
            room={room}
            index={i}
            onOpen={() => onOpen(room.id)}
            onRemix={() => onRemix(room.id)}
            primaryLabel="Edit"
          />
        ))}
      </GallerySection>

      <GallerySection title="Shared with your circle" empty="Nothing shared yet.">
        {circle.map((room, i) => (
          <GalleryCard
            key={room.id}
            room={room}
            index={i}
            onOpen={() => onOpen(room.id)}
            onRemix={() => onRemix(room.id)}
            primaryLabel="View / remix"
          />
        ))}
      </GallerySection>
    </section>
  )
}

function GallerySection({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode
}) {
  const items = Array.isArray(children) ? children : [children]
  const has = items.filter(Boolean).length > 0
  return (
    <div className="gallery-section">
      <h3>{title}</h3>
      {has ? <div className="gallery-grid">{children}</div> : <p className="empty">{empty}</p>}
    </div>
  )
}

function GalleryCard({
  room,
  index,
  onOpen,
  onRemix,
  primaryLabel,
}: {
  room: Room
  index: number
  onOpen: () => void
  onRemix: () => void
  primaryLabel: string
}) {
  return (
    <motion.article
      className="gallery-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button type="button" className="gallery-card__stage" onClick={onOpen}>
        <RoomStage room={room} compact />
      </button>
      <div className="gallery-card__meta">
        <strong>{room.name}</strong>
        <span>
          by {room.author}
          {room.authorKind === 'family' ? ' · family' : room.authorKind === 'friend' ? ' · friend' : ''}
          {room.shared && room.authorKind === 'you' ? ' · shared' : ''}
        </span>
        {room.lineage.length > 1 && (
          <p className="lineage-hint">Remix of {room.lineage.slice(-1)[0]}</p>
        )}
        <div className="cta-row tight">
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpen}>
            {primaryLabel}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemix}>
            Remix this
          </button>
        </div>
      </div>
    </motion.article>
  )
}
