import { useEffect, useMemo, useRef, useState } from 'react'
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
import { PlayerSync } from './components/PlayerSync'
import { ShareSheet } from './components/ShareSheet'
import { TemplatePicker } from './components/TemplatePicker'
import { fetchCloudStatus, fetchPlayerRooms, savePlayerRooms, type CloudStatus } from './lib/api'
import {
  loadDisplayName,
  loadPlayerCode,
  saveDisplayName,
  savePlayerCode,
} from './lib/player'
import {
  clearInviteHash,
  parseInviteFromLocation,
  resolveInvite,
} from './lib/share'
import {
  duplicateRoom,
  loadRooms,
  mergeRoomLists,
  persistRooms,
  remixOf,
  roomFromTemplate,
  templateById,
} from './lib/rooms'
import { weeklyChallenge } from './lib/weekly'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = loadRooms()
    if (saved?.length) return saved
    return buildSampleGallery()
  })
  const [view, setView] = useState<View>({ name: 'home' })
  const [toast, setToast] = useState<string | null>(null)
  const [pendingInvite, setPendingInvite] = useState<Room | null>(null)
  const [playerCode, setPlayerCode] = useState(() => loadPlayerCode())
  const [displayName, setDisplayName] = useState(() => loadDisplayName())
  const [showSync, setShowSync] = useState(false)
  const [cloud, setCloud] = useState<CloudStatus>({
    ok: false,
    backend: 'offline',
    durable: false,
  })
  const [hydrated, setHydrated] = useState(false)
  const saveTimer = useRef<number | null>(null)
  const weekly = useMemo(() => weeklyChallenge(), [])

  useEffect(() => {
    persistRooms(rooms)
  }, [rooms])

  // Cloud status + owned-room pull
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const status = await fetchCloudStatus()
      if (cancelled) return
      setCloud(status)

      const remote = await fetchPlayerRooms(playerCode)
      if (cancelled) return
      if (remote && remote.rooms.length) {
        setRooms((local) => {
          const merged = mergeRoomLists(local, remote.rooms)
          return merged
        })
        if (remote.displayName) {
          setDisplayName(remote.displayName)
          saveDisplayName(remote.displayName)
        }
        setToast('Restored rooms from your friend code')
      }
      setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [playerCode])

  // Debounced cloud save of owned + circle rooms for this player code
  useEffect(() => {
    if (!hydrated) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      const ownedAndCircle = rooms.filter(
        (r) => r.authorKind === 'you' || r.inviteImported || r.shared,
      )
      void savePlayerRooms(playerCode, ownedAndCircle, displayName).then((result) => {
        if (result.ok && result.durable) {
          setCloud((c) => ({ ...c, ok: true, backend: 'vercel-kv', durable: true }))
        } else if (result.ok) {
          setCloud((c) => ({ ...c, ok: true, backend: c.backend === 'offline' ? 'memory' : c.backend }))
        }
      })
    }, 900)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [rooms, playerCode, displayName, hydrated])

  // Invite hash → async resolve (cloud short code or embedded payload)
  useEffect(() => {
    let cancelled = false

    async function handlePayload(raw: string | null) {
      if (!raw) return
      const resolved = await resolveInvite(raw)
      if (cancelled || !resolved) return
      setPendingInvite(resolved)
      clearInviteHash()
    }

    void handlePayload(parseInviteFromLocation())

    const onHash = () => {
      void handlePayload(parseInviteFromLocation())
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      cancelled = true
      window.removeEventListener('hashchange', onHash)
    }
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

  const cloudLabel = !cloud.ok
    ? 'local save'
    : cloud.durable
      ? 'cloud sync on'
      : 'dev memory store'

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
    const room = roomFromTemplate(template, displayName === 'You' ? 'You' : displayName)
    // Soft nudge: preselect weekly challenge ribbon as optional
    upsert({ ...room, challengeId: weekly.id, ribbon: weekly.ribbon })
    setView({ name: 'editor', roomId: room.id })
    setToast(`Template loaded · week’s ${weekly.ribbon} ready`)
  }

  function remixRoom(id: string) {
    const source = rooms.find((r) => r.id === id)
    if (!source) return
    const room = remixOf(source, displayName === 'You' ? 'You' : displayName)
    upsert(room)
    setView({ name: 'editor', roomId: room.id })
    setToast(`Remixing ${source.name}`)
  }

  function duplicate(id: string) {
    const source = rooms.find((r) => r.id === id)
    if (!source) return
    const room = duplicateRoom(source, displayName === 'You' ? 'You' : displayName)
    upsert(room)
    setView({ name: 'editor', roomId: room.id })
    setToast('Room duplicated')
  }

  function confirmShare() {
    if (!activeRoom) return
    upsert({ ...activeRoom, shared: true })
    setView({ name: 'gallery' })
    setToast('Invite ready · saved to your gallery & friend code')
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

  async function switchPlayerCode(code: string) {
    const ok = savePlayerCode(code)
    if (!ok) return false
    setPlayerCode(code)
    const remote = await fetchPlayerRooms(code)
    if (remote) {
      if (remote.rooms.length) {
        setRooms(mergeRoomLists(loadRooms() ?? [], remote.rooms))
      }
      if (remote.displayName) {
        setDisplayName(remote.displayName)
        saveDisplayName(remote.displayName)
      }
    }
    setHydrated(true)
    return true
  }

  function updateDisplayName(name: string) {
    const next = name.slice(0, 32) || 'You'
    setDisplayName(next)
    saveDisplayName(next)
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
                onSync={() => setShowSync(true)}
                roomCount={yourSharedCount}
                playerCode={playerCode}
                weekly={weekly}
                cloudLabel={cloudLabel}
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
                weeklyId={weekly.id}
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
                playerCode={playerCode}
                onOpen={(id) => setView({ name: 'editor', roomId: id })}
                onRemix={remixRoom}
                onDuplicate={duplicate}
                onLineage={(id) => setView({ name: 'lineage', roomId: id })}
                onNew={() => setView({ name: 'templates' })}
                onJoin={() => setView({ name: 'join' })}
                onSync={() => setShowSync(true)}
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
          playerCode={playerCode}
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

      {showSync && (
        <PlayerSync
          playerCode={playerCode}
          displayName={displayName}
          cloudLabel={cloudLabel}
          onSaveCode={switchPlayerCode}
          onDisplayName={updateDisplayName}
          onClose={() => setShowSync(false)}
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
