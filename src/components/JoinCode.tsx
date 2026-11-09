import { useState } from 'react'
import { motion } from 'framer-motion'
import { resolveInvite } from '../lib/share'
import type { Room } from '../data/types'

type Props = {
  onJoin: (room: Room) => void
  onBack: () => void
}

export function JoinCode({ onJoin, onBack }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const room = await resolveInvite(value)
    setBusy(false)
    if (!room) {
      setError(
        'That invite didn’t resolve. Try a fresh RR2 short code, classic RR1 link, or check the cloud.',
      )
      return
    }
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
          <p>
            Paste an RR2 short code, classic RR1 invite, or the #invite= part of a link. Opens the
            real remote room when cloud sync is on — parent-clear, no open chat.
          </p>
        </div>
      </header>

      <motion.form
        className="join-form"
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label>
          <span>Invite code or link</span>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder="RR2.SUNNY4 or RR1.… or paste a full invite link"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="cta-row">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Looking up…' : 'Preview invite'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Cancel
          </button>
        </div>
      </motion.form>
    </section>
  )
}
