# Remix Rooms

Kids creative remix game: start from stylish room templates, remix décor/layout, and share with a **friends & family circle** via invite links/codes — not the open internet. No open chat.

Live: https://remix-rooms.vercel.app

## Play locally

```bash
npm install
npm run dev
```

## What works (v2)

- **Shareable invites** — copy a room link (`#invite=…`) or `RR1.` invite code; another browser can open and add it to their gallery
- **10 templates** — cozy, studio, loft, snack, spooky, garden, arcade, cloud fort, maker bench, rainy seat
- **Editor** — move (drag + nudge), recolor, stretch, stamp (incl. cushion/star/mirror/toy), walls/floors, undo/redo, duplicate room & prop
- **Gallery lineage** — remix pills with parent credit and depth; lineage view can open parent rooms
- **Parent-clear sharing** — friends/family metaphor only; no open chat
- Local persistence via `localStorage` (`remix-rooms:v2`)

## Deploy

Vercel auto-deploys `main`. Merge the v2 PR (or push to `main`) to ship.
