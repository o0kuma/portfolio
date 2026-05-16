/**
 * cleanup-old-posts.js
 *
 * Previews posts older than 30 days that are NOT featured.
 * Add --confirm-delete to perform the destructive deletion.
 *
 * Usage:
 *   node server/scripts/cleanup-old-posts.js
 *   node server/scripts/cleanup-old-posts.js --confirm-delete
 *
 * Reads DATABASE_URL from server/.env automatically.
 */

'use strict'

const path = require('path')
const fs = require('fs')

// ---------------------------------------------------------------------------
// Load server/.env
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.warn('[cleanup] server/.env not found — relying on environment variables')
    return
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([^=:#]+)=(.*)$/)
    if (!match) continue
    const key = match[1].trim()
    const val = match[2].trim().replace(/^["']|["']$/g, '')
    if (key && val && !process.env[key]) {
      process.env[key] = val
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  loadEnv()
  const shouldDelete = process.argv.includes('--confirm-delete')

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('[cleanup] ERROR: DATABASE_URL is not set.')
    process.exit(1)
  }

  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    console.log('[cleanup] Connecting to database…')

    // 1. Preview: list posts that will be deleted
    const preview = await pool.query(
      `SELECT id, title, category, created_at
       FROM posts
       WHERE created_at < NOW() - INTERVAL '30 days'
         AND featured = false
       ORDER BY created_at ASC`,
    )

    if (preview.rows.length === 0) {
      console.log('[cleanup] No posts older than 30 days (non-featured) found. Nothing to delete.')
      return
    }

    console.log(`\n[cleanup] Found ${preview.rows.length} post(s) to delete:\n`)
    preview.rows.forEach((row, idx) => {
      const age = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000)
      console.log(
        `  ${String(idx + 1).padStart(3)}. [${row.category}] ${row.title}  (${age}d old, id=${row.id})`,
      )
    })

    if (!shouldDelete) {
      console.log('\n[cleanup] Dry run only. Re-run with --confirm-delete to delete these posts.')
      return
    }

    // 2. Delete only after an explicit confirmation flag.
    const del = await pool.query(
      `DELETE FROM posts
       WHERE created_at < NOW() - INTERVAL '30 days'
         AND featured = false
       RETURNING id, title`,
    )

    console.log(`\n[cleanup] Deleted ${del.rows.length} post(s) successfully.`)
    del.rows.forEach((row) => console.log(`  - [${row.id}] ${row.title}`))
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[cleanup] Fatal error:', err.message)
  process.exit(1)
})
