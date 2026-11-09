import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  rooms: Room[]
  playerCode: string
  onOpen: (id: string) => void
  onRemix: (id: string) => void
  onDuplicate: (id: string) => void
  onLineage: (id: string) => void
  onNew: () => void
  onJoin: () => void
  onSync: () => void
  onBack: () => void
}

export function Gallery({
  rooms,
  playerCode,
  onOpen,
  onRemix,
  onDuplicate,
  onLineage,
  onNew,
  onJoin,
  onSync,
  onBack,
}: Props) {
  const yours = rooms.filter((r) => r.authorKind === 'you')
  const circle = rooms.filter((r) => r.authorKind !== 'you')

  return (
    <section className="panel">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Home
        </button>
        <div>
          <h2>Friends & family gallery</h2>
          <p>
            Private circle only — cloud invites show the real remote room with remix lineage. No
            open chat, no stranger feed.
          </p>
          <button type="button" className="player-chip player-chip--inline" onClick={onSync}>
            Your code <strong>{playerCode}</strong>
          </button>
        </div>
        <div className="cta-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onJoin}>
            Open invite
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onNew}>
            New from template
          </button>
        </div>
      </header>

      <GallerySection title="Your rooms" empty="You haven’t remixed yet — pick a template!">
        {yours.map((room, i) => (
          <GalleryCard
            key={room.id}
            room={room}
            index={i}
            onOpen={() => onOpen(room.id)}
            onRemix={() => onRemix(room.id)}
            onDuplicate={() => onDuplicate(room.id)}
            onLineage={() => onLineage(room.id)}
            primaryLabel="Edit"
            showDuplicate
          />
        ))}
      </GallerySection>

      <GallerySection title="Shared with your circle" empty="Nothing shared yet — open an invite!">
        {circle.map((room, i) => (
          <GalleryCard
            key={room.id}
            room={room}
            index={i}
            onOpen={() => onOpen(room.id)}
            onRemix={() => onRemix(room.id)}
            onDuplicate={() => onDuplicate(room.id)}
            onLineage={() => onLineage(room.id)}
            primaryLabel="View"
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
  onDuplicate,
  onLineage,
  primaryLabel,
  showDuplicate,
}: {
  room: Room
  index: number
  onOpen: () => void
  onRemix: () => void
  onDuplicate: () => void
  onLineage: () => void
  primaryLabel: string
  showDuplicate?: boolean
}) {
  const remixOf = room.parentName ?? (room.lineage.length > 1 ? room.lineage[room.lineage.length - 1] : null)

  return (
    <motion.article
      className="gallery-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: 'spring', stiffness: 320, damping: 24 }}
      whileHover={{ y: -3 }}
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
          {room.inviteImported ? ' · invite' : ''}
        </span>
        {remixOf && (
          <button type="button" className="lineage-pill" onClick={onLineage}>
            Remix of {remixOf}
            {room.parentAuthor ? ` · ${room.parentAuthor}` : ''}
            <span className="lineage-pill__depth">{room.lineage.length}↗</span>
          </button>
        )}
        {!remixOf && room.lineage[0] && (
          <p className="lineage-hint">Started from {room.lineage[0]}</p>
        )}
        <div className="cta-row tight">
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpen}>
            {primaryLabel}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemix}>
            Remix this
          </button>
          {showDuplicate && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onDuplicate}>
              Duplicate
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
