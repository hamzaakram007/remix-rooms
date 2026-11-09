import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Room } from '../data/types'
import { publishInvite } from '../lib/api'
import {
  buildInviteUrl,
  buildInviteUrlFromRoom,
  encodeCloudInvite,
  encodeInvite,
  shortInviteLabel,
} from '../lib/share'
import { RoomStage } from './RoomStage'

type Props = {
  room: Room
  playerCode: string
  onConfirm: () => void
  onCancel: () => void
}

export function ShareSheet({ room, playerCode, onConfirm, onCancel }: Props) {
  const [inviteCode, setInviteCode] = useState(() => encodeInvite(room))
  const [inviteUrl, setInviteUrl] = useState(() => buildInviteUrlFromRoom(room))
  const [mode, setMode] = useState<'cloud' | 'embedded' | 'publishing'>('publishing')
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const published = await publishInvite(room, playerCode)
      if (cancelled) return
      // Only advertise short codes when the store is durable across devices
      if (published?.durable) {
        const code = encodeCloudInvite(published.shortCode)
        setInviteCode(code)
        setInviteUrl(buildInviteUrl(code))
        setMode('cloud')
      } else {
        const embedded = encodeInvite(room)
        setInviteCode(embedded)
        setInviteUrl(buildInviteUrlFromRoom(room))
        setMode('embedded')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [room, playerCode])

  async function copy(kind: 'link' | 'code') {
    const text = kind === 'link' ? inviteUrl : inviteCode
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1800)
  }

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
        <h2 id="share-title">Share with family</h2>
        <p className="share-copy">
          Send a <strong>room link</strong> or <strong>invite code</strong> so another device can
          open this remix. Parent-clear sharing — <strong>no open chat</strong>, not a public feed.
        </p>
        <div className="share-preview">
          <RoomStage room={room} compact />
        </div>

        <p className="share-mode" role="status">
          {mode === 'publishing' && 'Publishing invite to the cloud…'}
          {mode === 'cloud' && 'Cloud invite ready — works across browsers & devices.'}
          {mode === 'embedded' &&
            'Offline fallback — full room rides in the link (classic invite).'}
        </p>

        <label className="share-field">
          <span>Shareable link</span>
          <div className="share-field__row">
            <input
              readOnly
              value={inviteUrl}
              aria-label="Invite link"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copy('link')}
              disabled={mode === 'publishing'}
            >
              {copied === 'link' ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </label>

        <label className="share-field">
          <span>Invite code · {shortInviteLabel(inviteCode)}</span>
          <div className="share-field__row">
            <input
              readOnly
              value={inviteCode}
              aria-label="Invite code"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copy('code')}
              disabled={mode === 'publishing'}
            >
              {copied === 'code' ? 'Copied!' : 'Copy code'}
            </button>
          </div>
        </label>

        <ul className="share-checks">
          <li>Cross-device: cloud short codes fetch the real room</li>
          <li>Remix lineage stays attached</li>
          <li>Friends & family only — no open internet chat</li>
        </ul>
        <div className="cta-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={mode === 'publishing'}
          >
            {room.shared ? 'Mark shared & done' : 'Save to my gallery too'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Back to editor
          </button>
        </div>
      </motion.div>
    </div>
  )
}
