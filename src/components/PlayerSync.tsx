import { useState } from 'react'
import { motion } from 'framer-motion'
import { isValidPlayerCode, normalizePlayerCode } from '../lib/player'

type Props = {
  playerCode: string
  displayName: string
  cloudLabel: string
  onSaveCode: (code: string) => Promise<boolean>
  onDisplayName: (name: string) => void
  onClose: () => void
}

export function PlayerSync({
  playerCode,
  displayName,
  cloudLabel,
  onSaveCode,
  onDisplayName,
  onClose,
}: Props) {
  const [draft, setDraft] = useState(playerCode)
  const [name, setName] = useState(displayName)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function applyCode(e: React.FormEvent) {
    e.preventDefault()
    const next = normalizePlayerCode(draft)
    if (!isValidPlayerCode(next)) {
      setMessage('Use a friend code like CORAL-7K2M')
      return
    }
    setBusy(true)
    const ok = await onSaveCode(next)
    setBusy(false)
    setMessage(ok ? 'Synced with that friend code!' : 'Couldn’t load that code — try again.')
  }

  return (
    <div className="modal-scrim">
      <motion.div
        className="modal player-sync"
        role="dialog"
        aria-labelledby="sync-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <h2 id="sync-title">Your friend code</h2>
        <p className="share-copy">
          Keep this code on your devices to reload <strong>your rooms</strong> after refresh or on
          another tablet. No email login — family & friends only. Cloud: {cloudLabel}.
        </p>

        <label className="share-field">
          <span>Display name</span>
          <input
            value={name}
            maxLength={32}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onDisplayName(name.trim() || 'You')}
          />
        </label>

        <form className="share-field" onSubmit={applyCode}>
          <span>Friend / family code</span>
          <div className="share-field__row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.toUpperCase())}
              spellCheck={false}
              autoComplete="off"
              aria-label="Player friend code"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'Syncing…' : 'Use code'}
            </button>
          </div>
        </form>

        {message && <p className="form-error" style={{ color: 'var(--foam)' }}>{message}</p>}

        <ul className="share-checks">
          <li>Same code → same owned rooms across browsers</li>
          <li>Invites still work with short RR2 codes or classic links</li>
          <li>No open chat, no stranger discovery</li>
        </ul>

        <div className="cta-row">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
