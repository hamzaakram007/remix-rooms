# Remix Rooms

Kids creative remix game: start from stylish room templates, remix décor/layout, and share with a **friends & family circle** via invite links/codes — not the open internet. No open chat.

Live: https://remix-rooms.vercel.app

## Play locally

```bash
npm install
npm run dev
```

Local play works **without cloud secrets**. Rooms persist in `localStorage` (`remix-rooms:v3`), and classic embedded `RR1.` invites still work offline. Cloud short codes (`RR2.`) and cross-device friend-code sync need the API + KV (below).

## What works (v3)

- **Cross-device invites** — share publishes to `/api/invite` and returns a short `RR2.` code; another browser/device fetches the real room payload. Classic `RR1.` embedded links remain as offline fallback.
- **Owned-room cloud save** — kid-simple friend codes (e.g. `CORAL-7K2M`), no email login. Create/edit/remix syncs to `/api/player` and reloads after refresh or on another device with the same code.
- **Friends & family gallery** — invited rooms keep remix lineage; browsing/joining shows the remote room, not a fake stub.
- **Weekly challenge ribbon** — soft, cosmetic-only nudge to remix & share (no gacha).
- **Parent-clear** — sticker/notes-free social text; no open chat; no stranger discovery feed.
- Mobile-first teal–sunrise UI; `prefers-reduced-motion` respected.

## Backend (Vercel KV / Upstash Redis)

Serverless Edge routes under `/api` store invites and player rooms.

| Route | Purpose |
| ----- | ------- |
| `GET /api/status` | Cloud backend health (`vercel-kv` vs in-memory) |
| `POST /api/invite` | Publish a room → short invite code |
| `GET /api/invite?code=` | Fetch room by short code |
| `GET /api/player?code=` | Load rooms for a friend code |
| `PUT /api/player` | Save rooms for a friend code |

### Env vars to add in Vercel (names only)

Add a **Vercel KV** store (or Upstash Redis) to the project, then set:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Equivalent Upstash names also work:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without these, the API falls back to an in-memory Map (local/dev only — not durable across serverless instances). The Vite client still builds and plays with localStorage + embedded invites.

### Local API (optional)

```bash
npx vercel dev
```

Requires the Vercel CLI; with KV env vars in `.env.local`, short codes and friend-code sync work against a real store.

## Deploy

Vercel auto-deploys `main`. Merge the product-depth PR (or push to `main`) to ship. After merge, attach KV and set the env var names above so production invites/sync are durable.
