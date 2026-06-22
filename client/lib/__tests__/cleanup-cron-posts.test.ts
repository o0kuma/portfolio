import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('cleanupOldCronPosts SQL safety', () => {
  const source = readFileSync(resolve(__dirname, '../cleanup-cron-posts.ts'), 'utf8')

  it('only deletes cron posts by age when they are not featured', () => {
    expect(source).toMatch(/source\s*=\s*'cron'/i)
    expect(source).toMatch(/featured\s*=\s*false/i)
  })

  it('count-based pruning also skips featured cron posts', () => {
    const countDelete = source.match(/Step 2[\s\S]*?RETURNING id`/)?.[0] ?? ''
    expect(countDelete).toMatch(/source\s*=\s*'cron'/i)
    expect(countDelete).toMatch(/featured\s*=\s*false/i)
  })
})
