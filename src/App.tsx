import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CHALLENGES } from './data/challenges'
import { buildSampleGallery } from './data/gallery'
import { TEMPLATES } from './data/templates'
import type { Room, View } from './data/types'
import { Editor } from './components/Editor'
import { Gallery } from './components/Gallery'
import { Home } from './components/Home'
import { Lineage } from './components/Lineage'
import { ShareSheet } from './components/ShareSheet'
import { TemplatePicker } from './components/TemplatePicker'
import { loadRooms, persistRooms, remixOf, roomFromTemplate, templateById } from './lib/rooms'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = loadRooms()
    if (saved?.length) return saved
    return buildSampleGallery()
  })
  const [view, setView] = useState<View>({ name: 'home' })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    persistRooms(rooms)
  }, [rooms])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const activeRoom = useMemo(() => {
    if (!('roomId' in view)) return null
    return rooms.find((r) => r.id === view.roomId) ?? null
  }, [rooms, view])

  function upsert(room: Room) {
    setRooms((prev) => {
      const i = prev.findIndex((r) => r.id === room.id)
      if (i === -1) return [room, ...prev]
      const next = [...prev]
      next[i] = room
      return next
    })
  }

  function startFromTemplate(templateId: string) {
    const template = templateById(templateId) ?? TEMPLATES[0]
    const room = roomFromTemplate(template)
    upsert(room)
    setView({ name: 'editor', roomId: room.id })
    setToast('Template loaded — remix away!')
  }

  function remixRoom(id: string) {
    const source = rooms.find((r) => r.id === id)
    if (!source) return
    const room = remixOf(source)
    upsert(room)
    setView({ name: 'editor', roomId: room.id })
    setToast(`Remixing ${source.name}`)
  }

  function confirmShare() {
    if (!activeRoom) return
    upsert({ ...activeRoom, shared: true })
    setView({ name: 'gallery' })
    setToast('Shared to your friends & family gallery')
  }

  const yourSharedCount = rooms.filter((r) => r.authorKind === 'you' || r.shared).length

  return (
    <div className="app-shell">
      <nav className="topnav">
        <button type="button" className="brand-mark" onClick={() => setView({ name: 'home' })}>
          <span className="brand-mark__icon" aria-hidden />
          Remix Rooms
        </button>
        <div className="topnav__links">
          <button type="button" onClick={() => setView({ name: 'templates' })}>
            Templates
          </button>
          <button type="button" onClick={() => setView({ name: 'gallery' })}>
            Gallery
          </button>
        </div>
      </nav>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey(view)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {view.name === 'home' && (
              <Home
                onStart={() => setView({ name: 'templates' })}
                onGallery={() => setView({ name: 'gallery' })}
                roomCount={yourSharedCount}
              />
            )}

            {view.name === 'templates' && (
              <TemplatePicker
                onPick={startFromTemplate}
                onBack={() => setView({ name: 'home' })}
              />
            )}

            {view.name === 'editor' && activeRoom && (
              <Editor
                room={activeRoom}
                challenges={CHALLENGES}
                onChange={upsert}
                onShare={() => setView({ name: 'share', roomId: activeRoom.id })}
                onLineage={() => setView({ name: 'lineage', roomId: activeRoom.id })}
                onBack={() => setView({ name: 'gallery' })}
              />
            )}

            {view.name === 'gallery' && (
              <Gallery
                rooms={rooms}
                onOpen={(id) => setView({ name: 'editor', roomId: id })}
                onRemix={remixRoom}
                onNew={() => setView({ name: 'templates' })}
                onBack={() => setView({ name: 'home' })}
              />
            )}

            {view.name === 'lineage' && activeRoom && (
              <Lineage
                room={activeRoom}
                onBack={() => setView({ name: 'editor', roomId: activeRoom.id })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {view.name === 'share' && activeRoom && (
        <ShareSheet
          room={activeRoom}
          onConfirm={confirmShare}
          onCancel={() => setView({ name: 'editor', roomId: activeRoom.id })}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function viewKey(view: View) {
  return 'roomId' in view ? `${view.name}:${view.roomId}` : view.name
}
