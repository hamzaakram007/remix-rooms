import { motion } from 'framer-motion'
import type { Challenge } from '../data/types'
import { daysLeftInWeek } from '../lib/weekly'

type Props = {
  challenge: Challenge
  onRemix?: () => void
  compact?: boolean
}

export function WeeklyRibbon({ challenge, onRemix, compact }: Props) {
  const days = daysLeftInWeek()

  return (
    <motion.aside
      className={`weekly-ribbon ${compact ? 'weekly-ribbon--compact' : ''}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`This week’s challenge: ${challenge.title}`}
    >
      <div className="weekly-ribbon__badge" aria-hidden>
        Week
      </div>
      <div className="weekly-ribbon__body">
        <strong>{challenge.title}</strong>
        <p>
          {challenge.prompt} Earn the <em>{challenge.ribbon}</em> — cosmetic only, no gacha.
          {days <= 2 ? ' Almost week’s end — remix & share!' : ` ${days} days left to share.`}
        </p>
      </div>
      {onRemix && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onRemix}>
          Remix for it
        </button>
      )}
    </motion.aside>
  )
}
