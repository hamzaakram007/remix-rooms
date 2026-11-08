import { useState } from 'react'
import { motion } from 'framer-motion'
import { decodeInvite } from '../lib/share'
import type { Room } from '../data/types'

type Props = {
  onJoin: (room: Room) => void
  onBack: () => void
}

export function JoinCode({ onJoin, onBack }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const room = decodeInvite(value)
    if (!room) {
      setError('That invite code or link snippet didn’t decode. Ask for a fresh copy.')
      return
    }
    setError(null)
    onJoin(room)
  }

  return (
    <section className="panel join-panel">
      <header className="panel__head">
        <button type="button" className="linkish" onClick={onBack}>
          ← Home
        </button>
        <div>
          <h2>Open a family invite</h2>
          <p>Paste a Remix Rooms invite code or the #invite= part of a link. Parent-clear — no open chat.</p>
        </div>
      </header>

      <motion.form
        className="join-form"
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label>
          <span>Invite code or payload</span>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder="RR1.… or paste invite payload"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="cta-row">
          <button type="submit" className="btn btn-primary">
            Preview invite
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Cancel
          </button>
        </div>
      </motion.form>
    </section>
  )
}
