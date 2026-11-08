import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  room: Room
  onAccept: (as: 'friend' | 'family') => void
  onDecline: () => void
}

export function InviteAccept({ room, onAccept, onDecline }: Props) {
  return (
    <div className="modal-scrim">
      <motion.div
        className="modal share-sheet"
        role="dialog"
        aria-labelledby="invite-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      >
        <h2 id="invite-title">Family invite arrived</h2>
        <p className="share-copy">
          <strong>{room.author}</strong> shared <strong>{room.name}</strong> with your circle.
          Add it to your friends & family gallery — then remix it if you want. No chat opens.
        </p>
        <div className="share-preview">
          <RoomStage room={room} compact />
        </div>
        {room.lineage.length > 0 && (
          <p className="lineage-hint invite-lineage">
            Lineage: {room.lineage.join(' → ')} → {room.name}
          </p>
        )}
        <div className="cta-row">
          <button type="button" className="btn btn-primary" onClick={() => onAccept('friend')}>
            Add as friend room
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onAccept('family')}>
            Add as family
          </button>
          <button type="button" className="btn btn-ghost" onClick={onDecline}>
            Not now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
