import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Challenge, PropKind, Room } from '../data/types'
import {
  FLOOR_SWATCHES,
  STAMPABLE,
  WALL_SWATCHES,
  nextColor,
  stampProp,
} from '../lib/rooms'
import { RoomStage } from './RoomStage'
import { PROP_LABELS } from './PropGlyph'

type Tool = 'select' | 'recolor' | 'stretch' | 'stamp' | 'walls'

type Props = {
  room: Room
  challenges: Challenge[]
  onChange: (room: Room) => void
  onShare: () => void
  onLineage: () => void
  onBack: () => void
}

export function Editor({ room, challenges, onChange, onShare, onLineage, onBack }: Props) {
  const [tool, setTool] = useState<Tool>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stampKind, setStampKind] = useState<PropKind>('plant')
  const selected = useMemo(
    () => room.props.find((p) => p.id === selectedId) ?? null,
    [room.props, selectedId],
  )

  function updateProp(id: string, patch: Partial<Room['props'][number]>) {
    onChange({
      ...room,
      props: room.props.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    if (tool === 'recolor') {
      const prop = room.props.find((p) => p.id === id)
      if (prop) updateProp(id, { color: nextColor(prop.color) })
    } else if (tool === 'stretch') {
      const prop = room.props.find((p) => p.id === id)
      if (prop) {
        const next = prop.scale >= 1.35 ? 0.75 : +(prop.scale + 0.15).toFixed(2)
        updateProp(id, { scale: next })
      }
    }
  }

  function handleStageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (tool !== 'stamp') {
      setSelectedId(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const prop = stampProp(stampKind, clamp(x, 8, 92), clamp(y, 18, 88))
    onChange({ ...room, props: [...room.props, prop] })
    setSelectedId(prop.id)
  }

  function nudge(dx: number, dy: number) {
    if (!selected) return
    updateProp(selected.id, {
      x: clamp(selected.x + dx, 6, 94),
      y: clamp(selected.y + dy, 12, 90),
    })
  }

  function removeSelected() {
    if (!selected) return
    onChange({ ...room, props: room.props.filter((p) => p.id !== selected.id) })
    setSelectedId(null)
  }

  function applyChallenge(id: string) {
    const c = challenges.find((ch) => ch.id === id)
    if (!c) return
    onChange({ ...room, challengeId: c.id, ribbon: c.ribbon })
  }

  return (
    <section className="editor">
      <header className="editor__bar">
        <button type="button" className="linkish" onClick={onBack}>
          ← Rooms
        </button>
        <input
          className="name-input"
          value={room.name}
          aria-label="Room name"
          onChange={(e) => onChange({ ...room, name: e.target.value })}
        />
        <div className="editor__actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onLineage}>
            Lineage
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onShare}>
            Share with family
          </button>
        </div>
      </header>

      <div className="editor__stage-wrap" onClick={handleStageClick}>
        <RoomStage
          room={room}
          selectedId={selectedId}
          onSelect={handleSelect}
          interactive
        />
      </div>

      <div className="tool-dock">
        {(
          [
            ['select', 'Move'],
            ['recolor', 'Recolor'],
            ['stretch', 'Stretch'],
            ['stamp', 'Stamp'],
            ['walls', 'Walls'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tool-chip ${tool === id ? 'is-on' : ''}`}
            onClick={() => setTool(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tool}
          className="tool-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
        >
          {tool === 'select' && (
            <div className="tool-panel__row">
              <p>{selected ? `Selected: ${PROP_LABELS[selected.kind]}` : 'Tap a prop, then nudge it.'}</p>
              <div className="nudge">
                <button type="button" onClick={() => nudge(0, -4)} disabled={!selected}>
                  ↑
                </button>
                <button type="button" onClick={() => nudge(-4, 0)} disabled={!selected}>
                  ←
                </button>
                <button type="button" onClick={() => nudge(4, 0)} disabled={!selected}>
                  →
                </button>
                <button type="button" onClick={() => nudge(0, 4)} disabled={!selected}>
                  ↓
                </button>
                <button type="button" className="danger" onClick={removeSelected} disabled={!selected}>
                  Remove
                </button>
              </div>
            </div>
          )}

          {tool === 'recolor' && (
            <p>Tap any prop to cycle its color. Walls & floors live under Walls.</p>
          )}

          {tool === 'stretch' && (
            <p>Tap a prop to grow it — tap again when it maxes out to shrink.</p>
          )}

          {tool === 'stamp' && (
            <div className="stamp-row">
              <p>Choose a stamp, then tap the room to place it.</p>
              <div className="stamp-kinds">
                {STAMPABLE.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`stamp-btn ${stampKind === k ? 'is-on' : ''}`}
                    onClick={() => setStampKind(k)}
                  >
                    {PROP_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === 'walls' && (
            <div className="swatch-block">
              <div>
                <span>Walls</span>
                <div className="swatches">
                  {WALL_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`swatch ${room.wallColor === c ? 'is-on' : ''}`}
                      style={{ background: c }}
                      aria-label={`Wall ${c}`}
                      onClick={() => onChange({ ...room, wallColor: c })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span>Floor</span>
                <div className="swatches">
                  {FLOOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`swatch ${room.floorColor === c ? 'is-on' : ''}`}
                      style={{ background: c }}
                      aria-label={`Floor ${c}`}
                      onClick={() => onChange({ ...room, floorColor: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="challenge-strip">
        <span>Optional challenge ribbons</span>
        <div className="challenge-strip__row">
          {challenges.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`ribbon-chip ${room.challengeId === c.id ? 'is-on' : ''}`}
              onClick={() => applyChallenge(c.id)}
              title={c.prompt}
            >
              {c.ribbon}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
