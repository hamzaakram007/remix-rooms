import { motion } from 'framer-motion'
import { TEMPLATES } from '../data/templates'
import { RoomStage } from './RoomStage'
import { roomFromTemplate } from '../lib/rooms'

type Props = {
  onStart: () => void
  onGallery: () => void
  onJoin: () => void
  roomCount: number
}

export function Home({ onStart, onGallery, onJoin, roomCount }: Props) {
  const preview = roomFromTemplate(TEMPLATES[0]!)

  return (
    <section className="home">
      <div className="home__bg" aria-hidden />
      <motion.div
        className="home__brand"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Friends & family · invite links · no open chat</p>
        <h1 className="brand-title">
          Remix
          <span> Rooms</span>
        </h1>
        <p className="lede">
          Start from a stylish template, smash it into your own vibe, then share a parent-clear
          invite with people you actually know.
        </p>
        <div className="cta-row">
          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={onStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Pick a template
          </motion.button>
          <button type="button" className="btn btn-ghost" onClick={onGallery}>
            Family gallery{roomCount ? ` (${roomCount})` : ''}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onJoin}>
            Open invite
          </button>
        </div>
      </motion.div>

      <motion.div
        className="home__hero-stage"
        initial={{ opacity: 0, scale: 0.94, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <RoomStage room={preview} />
      </motion.div>
    </section>
  )
}
