import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('cleanup-cron-posts', () => {
  it('count-based prune skips featured cron posts', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../cleanup-cron-posts.ts'),
      'utf8',
    )

    expect(source).toMatch(/source\s*=\s*'cron'/)
    expect(source).toMatch(
      /SELECT id FROM posts[\s\S]*source = 'cron'[\s\S]*featured = false[\s\S]*OFFSET 100/,
    )
  })
})
