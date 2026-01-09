import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import handler from '#server/api/notes.get'

let testContext: ReturnType<typeof createTestContext>

vi.mock('#server/folder', () => {
  return {
    get notesPath() {
      return testContext?.notesDir
    },
    get uploadPath() {
      return testContext?.uploadsDir
    }
  }
})

describe('server/api/notes.get', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules()
  })

  afterEach(() => {
    testContext.cleanup()
  })

  it('should return empty list when directory is empty', async () => {
    const event = {
      context: {},
      node: { req: { url: 'http://localhost/' } },
      path: '/'
    } as any

    const result = await handler(event)
    expect(result).toEqual([])
  })

  it('should return files with preview', async () => {
    writeFileSync(join(testContext.notesDir, 'note1.md'), '# Note 1\nContent line 1')
    // Wait a bit or ensure distinct timestamps if needed for sorting, but code sorts by mtime
    // We can just rely on defaults

    const event = {
      context: {},
      node: { req: { url: 'http://localhost/?display=10' } },
      path: '/?display=10'
    } as any

    const result = await handler(event)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('note1.md')
    expect(result[0].preview).toContain('# Note 1')
    expect(result[0].isMarkdown).toBe(true)
  })

  it('should respect display limit', async () => {
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(testContext.notesDir, `note${i}.md`), `Content ${i}`)
    }

    const event = {
      context: {},
      // Query display=2
      node: { req: { url: 'http://localhost/?display=2' } },
      path: '/?display=2'
    } as any

    const result = await handler(event)
    expect(result).toHaveLength(2)
  })
})
