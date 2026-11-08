import { motion } from 'framer-motion'
import { TEMPLATES } from '../data/templates'
import { roomFromTemplate } from '../lib/rooms'
import { RoomStage } from './RoomStage'

type Props = {
  onPick: (templateId: string) => void
  onBack: () => void
}

export function TemplatePicker({ onPick, onBack }: Props) {
  return (
    <section className="panel">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2>Pick a starting room</h2>
          <p>{TEMPLATES.length} templates — no blank canvas. Remix from a vibe you like.</p>
        </div>
      </header>

      <div className="template-grid">
        {TEMPLATES.map((t, i) => {
          const preview = roomFromTemplate(t)
          return (
            <motion.button
              key={t.id}
              type="button"
              className="template-card"
              onClick={() => onPick(t.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <RoomStage room={preview} compact />
              <div className="template-card__meta">
                <strong>{t.name}</strong>
                <span>{t.vibe}</span>
                <p>{t.blurb}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
