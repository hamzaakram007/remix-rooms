import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CHALLENGES } from './data/challenges'
import { buildSampleGallery } from './data/gallery'
import { TEMPLATES } from './data/templates'
import type { Room, View } from './data/types'
import { Editor } from './components/Editor'
import { Gallery } from './components/Gallery'
import { Home } from './components/Home'
import { InviteAccept } from './components/InviteAccept'
import { JoinCode } from './components/JoinCode'
import { Lineage } from './components/Lineage'
import { ShareSheet } from './components/ShareSheet'
import { TemplatePicker } from './components/TemplatePicker'
import { clearInviteHash, parseInviteFromLocation } from './lib/share'
import {
  duplicateRoom,
  loadRooms,
  persistRooms,
  remixOf,
  roomFromTemplate,
  templateById,
} from './lib/rooms'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = loadRooms()
    if (saved?.length) return saved
    return buildSampleGallery()
  })
  const [view, setView] = useState<View>({ name: 'home' })
  const [toast, setToast] = useState<string | null>(null)
  const [pendingInvite, setPendingInvite] = useState<Room | null>(null)

  useEffect(() => {
    persistRooms(rooms)
  }, [rooms])

  useEffect(() => {
    const incoming = parseInviteFromLocation()
    if (incoming) {
      setPendingInvite(incoming)
      clearInviteHash()
    }

    const onHash = () => {
      const room = parseInviteFromLocation()
      if (room) {
        setPendingInvite(room)
        clearInviteHash()
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

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
    const template = templateById(templateId) ?? TEMPLATES[0]!
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

  function duplicate(id: string) {
    const source = rooms.find((r) => r.id === id)
    if (!source) return
    const room = duplicateRoom(source)
    upsert(room)
    setView({ name: 'editor', roomId: room.id })
    setToast('Room duplicated')
  }

  function confirmShare() {
    if (!activeRoom) return
    upsert({ ...activeRoom, shared: true })
    setView({ name: 'gallery' })
    setToast('Invite ready · marked shared in your gallery')
  }

  function acceptInvite(as: 'friend' | 'family') {
    if (!pendingInvite) return
    const room: Room = {
      ...pendingInvite,
      authorKind: as,
      shared: true,
      inviteImported: true,
    }
    upsert(room)
    setPendingInvite(null)
    setView({ name: 'gallery' })
    setToast(`Added ${room.name} to your circle`)
  }

  function previewJoin(room: Room) {
    setPendingInvite(room)
    setView({ name: 'home' })
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
          <button type="button" onClick={() => setView({ name: 'join' })}>
            Invite
          </button>
        </div>
      </nav>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey(view)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {view.name === 'home' && (
              <Home
                onStart={() => setView({ name: 'templates' })}
                onGallery={() => setView({ name: 'gallery' })}
                onJoin={() => setView({ name: 'join' })}
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
                onDuplicate={() => duplicate(activeRoom.id)}
                onBack={() => setView({ name: 'gallery' })}
              />
            )}

            {view.name === 'gallery' && (
              <Gallery
                rooms={rooms}
                onOpen={(id) => setView({ name: 'editor', roomId: id })}
                onRemix={remixRoom}
                onDuplicate={duplicate}
                onLineage={(id) => setView({ name: 'lineage', roomId: id })}
                onNew={() => setView({ name: 'templates' })}
                onJoin={() => setView({ name: 'join' })}
                onBack={() => setView({ name: 'home' })}
              />
            )}

            {view.name === 'lineage' && activeRoom && (
              <Lineage
                room={activeRoom}
                rooms={rooms}
                onOpenParent={(id) => setView({ name: 'editor', roomId: id })}
                onRemix={() => remixRoom(activeRoom.id)}
                onBack={() => setView({ name: 'editor', roomId: activeRoom.id })}
              />
            )}

            {view.name === 'join' && (
              <JoinCode onJoin={previewJoin} onBack={() => setView({ name: 'home' })} />
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

      {pendingInvite && (
        <InviteAccept
          room={pendingInvite}
          onAccept={acceptInvite}
          onDecline={() => setPendingInvite(null)}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function viewKey(view: View) {
  if (view.name === 'invite') return `invite:${view.room.id}`
  return 'roomId' in view ? `${view.name}:${view.roomId}` : view.name
}
