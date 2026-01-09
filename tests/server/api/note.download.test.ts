import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let testContext: ReturnType<typeof createTestContext>

vi.mock('#server/folder', () => {
  return {
    get notesPath() {
      return testContext?.notesDir
    }
  }
})

// Stub sendStream (h3 util)
vi.stubGlobal(
  'sendStream',
  vi.fn().mockImplementation((event, stream) => stream)
)
vi.stubGlobal('setHeaders', vi.fn())

import handler from '#server/api/note/download/[...path].get'

describe('server/api/note/download', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules()

    mkdirSync(join(testContext.notesDir, 'notebook'), { recursive: true })
  })

  afterEach(() => {
    testContext.cleanup()
  })

  it('should stream note content', async () => {
    const noteName = 'note.md'
    const content = '# Download me'
    writeFileSync(join(testContext.notesDir, 'notebook', noteName), content)

    const event = {
      context: { params: { path: `notebook/${noteName}` } }
    } as any

    const result = (await handler(event)) as any
    // Should return the stream from sendStream -> createReadStream
    expect(result).toBeDefined()
    expect(result.path).toBeDefined() // ReadStream has path

    // Allow time for pending stream operations to settle before cleanup
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('should fail if note does not exist', async () => {
    const event = {
      context: { params: { path: `notebook/missing.md` } }
    } as any

    // Wrapper throws 404
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })
})
