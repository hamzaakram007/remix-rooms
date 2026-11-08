import { motion } from 'framer-motion'
import { TEMPLATES } from '../data/templates'
import { RoomStage } from './RoomStage'
import { roomFromTemplate } from '../lib/rooms'

type Props = {
  onStart: () => void
  onGallery: () => void
  roomCount: number
}

export function Home({ onStart, onGallery, roomCount }: Props) {
  const preview = roomFromTemplate(TEMPLATES[0])

  return (
    <section className="home">
      <div className="home__bg" aria-hidden />
      <motion.div
        className="home__brand"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Friends & family gallery · no open chat</p>
        <h1 className="brand-title">
          Remix
          <span> Rooms</span>
        </h1>
        <p className="lede">
          Start from a stylish template, smash it into your own vibe, then share with people you
          actually know.
        </p>
        <div className="cta-row">
          <button type="button" className="btn btn-primary" onClick={onStart}>
            Pick a template
          </button>
          <button type="button" className="btn btn-ghost" onClick={onGallery}>
            Family gallery{roomCount ? ` (${roomCount})` : ''}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="home__hero-stage"
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <RoomStage room={preview} />
        <div className="home__float-tag" aria-hidden>
          Template-first · no blank canvas
        </div>
      </motion.div>
    </section>
  )
}
