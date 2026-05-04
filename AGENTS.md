# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Korean-language portfolio website (`kuuuma.com`) with a Node.js Express backend (`server/`) and a Next.js 14 frontend (`client/`). It includes blog posts, portfolio projects, a contact form, AI chatbot, subscription/monetization features, and a Tetris game demo.

### Running the application

Both services can be started concurrently from the root:

```bash
npm run dev        # starts both server (:5000) and client (:3000)
```

Or individually:

```bash
cd server && npm run dev   # Express on :5000
cd client && npm run dev   # Next.js on :3000
```

### Environment

- The server reads `server/.env` (gitignored). A minimal `.env` with `NODE_ENV=development` and `PORT=5000` is sufficient for startup; the server gracefully handles missing `DATABASE_URL`.
- The Next.js client's `next.config.js` reads `server/.env` at dev time to load `DATABASE_URL` and `OPENAI_API_KEY`. No separate `client/.env.local` is strictly required.
- Without `DATABASE_URL`, posts/projects/contact/subscription DB features return errors, but the app itself starts and pages render (Tetris, portfolio, UI chrome all work).

### Lint / Test / Build

- **Lint (client):** `cd client && npx next lint` — pre-existing warnings/errors exist; the server has no eslint config.
- **Test (server):** `cd server && npm test` — uses Jest (requires test files to exist).
- **Build (client):** `cd client && npm run build` — succeeds; `eslint.ignoreDuringBuilds` is true in `next.config.js`.

### Key gotchas

- The root `package.json` uses `concurrently` to run both dev servers. Make sure dependencies are installed at root, server, and client levels (`npm run install:all`).
- `sharp` (image processing) is a native dependency in `server/`; it compiles during `npm install`. If it fails, the server still starts but image processing features won't work.
- The codebase is migrating from Supabase to Neon/raw PostgreSQL. Route files are named `*-supabase.js` but actually use the `pg` driver via `config/db.js`.
- Node.js 20 LTS is required (Next.js 14 minimum).
