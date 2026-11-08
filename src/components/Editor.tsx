import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Challenge, PropKind, Room } from '../data/types'
import {
  FLOOR_SWATCHES,
  STAMPABLE,
  WALL_SWATCHES,
  cloneProp,
  nextColor,
  snapshotRoom,
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
  onDuplicate: () => void
  onBack: () => void
}

const HISTORY_LIMIT = 40

export function Editor({
  room,
  challenges,
  onChange,
  onShare,
  onLineage,
  onDuplicate,
  onBack,
}: Props) {
  const [tool, setTool] = useState<Tool>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stampKind, setStampKind] = useState<PropKind>('plant')
  const [past, setPast] = useState<Room[]>([])
  const [future, setFuture] = useState<Room[]>([])
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null)
  const roomRef = useRef(room)
  roomRef.current = room

  const selected = useMemo(
    () => room.props.find((p) => p.id === selectedId) ?? null,
    [room.props, selectedId],
  )

  useEffect(() => {
    setPast([])
    setFuture([])
    setSelectedId(null)
  }, [room.id])

  function commit(next: Room) {
    setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), snapshotRoom(roomRef.current)])
    setFuture([])
    onChange(next)
  }

  function undo() {
    setPast((p) => {
      if (!p.length) return p
      const prev = p[p.length - 1]!
      setFuture((f) => [snapshotRoom(roomRef.current), ...f].slice(0, HISTORY_LIMIT))
      onChange(prev)
      return p.slice(0, -1)
    })
  }

  function redo() {
    setFuture((f) => {
      if (!f.length) return f
      const next = f[0]!
      setPast((p) => [...p, snapshotRoom(roomRef.current)].slice(-HISTORY_LIMIT))
      onChange(next)
      return f.slice(1)
    })
  }

  function updateProp(id: string, patch: Partial<Room['props'][number]>, record = true) {
    const next = {
      ...room,
      props: room.props.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }
    if (record) commit(next)
    else onChange(next)
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    if (tool === 'recolor') {
      const prop = room.props.find((p) => p.id === id)
      if (prop) updateProp(id, { color: nextColor(prop.color) })
    } else if (tool === 'stretch') {
      const prop = room.props.find((p) => p.id === id)
      if (prop) {
        const next = prop.scale >= 1.4 ? 0.7 : +(prop.scale + 0.12).toFixed(2)
        updateProp(id, { scale: next })
      }
    }
  }

  function handleStageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragRef.current?.moved) {
      dragRef.current = null
      return
    }
    if (tool !== 'stamp') {
      setSelectedId(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const prop = stampProp(stampKind, clamp(x, 8, 92), clamp(y, 18, 88))
    commit({ ...room, props: [...room.props, prop] })
    setSelectedId(prop.id)
  }

  function handlePropPointerDown(id: string, e: React.PointerEvent) {
    if (tool !== 'select') return
    e.stopPropagation()
    setSelectedId(id)
    const stage = (e.currentTarget as HTMLElement).closest('.editor__stage-wrap')
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    dragRef.current = { id, moved: false }
    const start = snapshotRoom(room)

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || dragRef.current.id !== id) return
      dragRef.current.moved = true
      const x = clamp(((ev.clientX - rect.left) / rect.width) * 100, 6, 94)
      const y = clamp(((ev.clientY - rect.top) / rect.height) * 100, 12, 90)
      onChange({
        ...roomRef.current,
        props: roomRef.current.props.map((p) => (p.id === id ? { ...p, x, y } : p)),
      })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (dragRef.current?.moved) {
        setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), start])
        setFuture([])
      }
      // keep dragRef briefly so click handler can see moved flag
      window.setTimeout(() => {
        dragRef.current = null
      }, 0)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
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
    commit({ ...room, props: room.props.filter((p) => p.id !== selected.id) })
    setSelectedId(null)
  }

  function duplicateSelected() {
    if (!selected) return
    const copy = cloneProp(selected)
    commit({ ...room, props: [...room.props, copy] })
    setSelectedId(copy.id)
  }

  function applyChallenge(id: string) {
    const c = challenges.find((ch) => ch.id === id)
    if (!c) return
    if (room.challengeId === c.id) {
      commit({ ...room, challengeId: undefined, ribbon: undefined })
      return
    }
    commit({ ...room, challengeId: c.id, ribbon: c.ribbon })
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
          onChange={(e) => commit({ ...room, name: e.target.value })}
        />
        <div className="editor__actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={undo}
            disabled={!past.length}
            title="Undo"
          >
            Undo
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={redo}
            disabled={!future.length}
            title="Redo"
          >
            Redo
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onLineage}>
            Lineage
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onShare}>
            Share invite
          </button>
        </div>
      </header>

      {(room.parentName || room.lineage.length > 1) && (
        <p className="editor__lineage-chip">
          Remix of <strong>{room.parentName ?? room.lineage[room.lineage.length - 1]}</strong>
          {room.parentAuthor ? ` by ${room.parentAuthor}` : ''}
          <span aria-hidden> · </span>
          {room.lineage.length} step{room.lineage.length === 1 ? '' : 's'} deep
        </p>
      )}

      <div className="editor__stage-wrap" onClick={handleStageClick}>
        <RoomStage
          room={room}
          selectedId={selectedId}
          onSelect={handleSelect}
          onPropPointerDown={handlePropPointerDown}
          interactive
        />
      </div>

      <div className="tool-dock" role="toolbar" aria-label="Room tools">
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
              <p>
                {selected
                  ? `Selected: ${PROP_LABELS[selected.kind]} — drag or nudge`
                  : 'Tap a prop, then drag or nudge it.'}
              </p>
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
                <button type="button" onClick={duplicateSelected} disabled={!selected}>
                  Dup prop
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
                      onClick={() => commit({ ...room, wallColor: c })}
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
                      onClick={() => commit({ ...room, floorColor: c })}
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
