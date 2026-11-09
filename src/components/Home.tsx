import { motion } from 'framer-motion'
import type { Challenge } from '../data/types'
import { TEMPLATES } from '../data/templates'
import { roomFromTemplate } from '../lib/rooms'
import { RoomStage } from './RoomStage'
import { WeeklyRibbon } from './WeeklyRibbon'

type Props = {
  onStart: () => void
  onGallery: () => void
  onJoin: () => void
  onSync: () => void
  roomCount: number
  playerCode: string
  weekly: Challenge
  cloudLabel: string
}

export function Home({
  onStart,
  onGallery,
  onJoin,
  onSync,
  roomCount,
  playerCode,
  weekly,
  cloudLabel,
}: Props) {
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
        <p className="eyebrow">Friends & family · cloud invites · no open chat</p>
        <h1 className="brand-title">
          Remix
          <span> Rooms</span>
        </h1>
        <p className="lede">
          Start from a stylish template, smash it into your own vibe, then share a parent-clear
          invite that works on another device — not the open internet.
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
        <WeeklyRibbon challenge={weekly} onRemix={onStart} compact />
        <button type="button" className="player-chip" onClick={onSync}>
          Friend code <strong>{playerCode}</strong>
          <span>· {cloudLabel}</span>
        </button>
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
