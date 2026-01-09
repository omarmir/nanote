import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Context for the tests
let testContext: ReturnType<typeof createTestContext>

// Mock server folder configuration to point to temp dir
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

// Mock auto-imported utils
vi.stubGlobal('authorize', vi.fn().mockResolvedValue(true))
vi.stubGlobal('editAllNotes', 'editAllNotes')

// Stub Nitro/Nuxt globals
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('useTranslation', () => (key: string) => key)
vi.stubGlobal('createError', (err: any) => err)
vi.stubGlobal('getQuery', (event: any) => {
  // Basic mock extracting from URL query params
  if (event.path && event.path.includes('?')) {
    const queryParams = new URLSearchParams(event.path.split('?')[1])
    return Object.fromEntries(queryParams.entries())
  }
  return {}
})

describe('server/api/notes.get', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules() // Ensure fresh import for each test or rely on cache?
    // We mocked '~/server/folder' dynamically accessing testContext, so we don't necessarily need to re-import
    // EXCEPT if the module captures the values?
    // 'server/folder' exports values. If notes.get.ts imports them, it might capture them.
    // But 'server/folder' exports `notesPath` which we mocked as a getter.
    // However, `notes.get.ts` does: `import { notesPath } from '~~/server/folder'`.
    // Does it use it dynamically?
    // `const files = await fg('**/*', { cwd: notesPath })`
    // It uses it inside the handler function. So getter is accessed when handler runs.
    // So distinct import is not strictly needed if mock works as getter.
  })

  afterEach(() => {
    testContext.cleanup()
  })

  it('should return empty list when directory is empty', async () => {
    const handler = (await import('#server/api/notes.get')).default
    const event = {
      context: {},
      node: { req: { url: 'http://localhost/' } },
      path: '/'
    } as any

    const result = await handler(event)
    expect(result).toEqual([])
  })

  it('should return files with preview', async () => {
    const handler = (await import('#server/api/notes.get')).default
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
    const handler = (await import('#server/api/notes.get')).default
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
