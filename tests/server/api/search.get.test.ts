import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import handler from '#server/api/search.get'
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

describe('server/api/search.get', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules()
  })

  afterEach(() => {
    testContext.cleanup()
  })

  it('should return empty results for no matches', async () => {
    const event = {
      context: {},
      path: '/?q=nothinghere'
    } as any

    const result = await handler(event)
    expect(result).toEqual([])
  })

  it('should find content in markdown files', async () => {
    writeFileSync(join(testContext.notesDir, 'search_me.md'), 'This is a unique string for searching.')

    const event = {
      context: {},
      path: '/?q=unique'
    } as any

    const result = await handler(event)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('search_me.md')
    expect(result[0].snippet).toContain('unique')
    expect(result[0].matchType).toBe('content')
  })

  it('should throw 400 if query is missing', async () => {
    const event = {
      context: {},
      path: '/'
    } as any

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })
})
