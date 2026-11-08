import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { RoomStage } from './RoomStage'

type Props = {
  room: Room
  onConfirm: () => void
  onCancel: () => void
}

export function ShareSheet({ room, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-scrim">
      <motion.div
        className="modal share-sheet"
        role="dialog"
        aria-labelledby="share-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <h2 id="share-title">Share with family gallery</h2>
        <p className="share-copy">
          This posts your room to your <strong>friends & family circle</strong> — the people a
          parent already knows. It is <strong>not</strong> a public internet post, and there is{' '}
          <strong>no open chat</strong>.
        </p>
        <div className="share-preview">
          <RoomStage room={room} compact />
        </div>
        <ul className="share-checks">
          <li>Visible to approved circle only</li>
          <li>Remix lineage stays attached</li>
          <li>Parents can review the gallery metaphor anytime</li>
        </ul>
        <div className="cta-row">
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {room.shared ? 'Keep shared' : 'Share to gallery'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Keep private
          </button>
        </div>
      </motion.div>
    </div>
  )
}
