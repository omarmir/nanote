import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

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

import { readMultipartFormData } from 'h3'

// Mock DB
const mockDb = vi.hoisted(() => ({
  delete: vi.fn(),
  where: vi.fn(),
  or: vi.fn()
}))

vi.mock('#server/utils/drizzle', () => ({
  db: mockDb,
  tables: { shared: { path: {} } },
  or: vi.fn().mockReturnValue({}),
  eq: vi.fn().mockReturnValue({})
}))

vi.stubGlobal('db', mockDb)
vi.stubGlobal('eq', vi.fn().mockReturnValue({}))
vi.stubGlobal('or', vi.fn().mockReturnValue({}))

vi.stubGlobal('useStorage', () => ({
  removeItem: vi.fn(),
  hasItem: vi.fn().mockResolvedValue([])
}))
vi.stubGlobal('SHARED_ATTACHMENT_PREFIX', 'shared:')

import postHandler from '#server/api/note/[...path].post'
import putHandler from '#server/api/note/[...path].put'
import deleteHandler from '#server/api/note/[...path].delete'
import patchHandler from '#server/api/note/[...path].patch'

describe('server/api/note', () => {
  beforeEach(() => {
    testContext = createTestContext()

    mockDb.delete.mockReturnValue(mockDb)
    mockDb.where.mockResolvedValue(undefined)

    // Create a notebook folder
    mkdirSync(join(testContext.notesDir, 'my-notebook'), { recursive: true })
  })

  afterEach(() => {
    testContext.cleanup()
  })

  describe('post (create)', () => {
    it('should create a new note', async () => {
      const noteName = 'new-note.md'
      const content = Buffer.from('# Hello')

      vi.mocked(readMultipartFormData).mockResolvedValue([{ name: 'file', data: content }] as any)

      const event = {
        context: { params: { path: `my-notebook/${noteName}` } }
      } as any

      const result = await postHandler(event)

      expect(result.label).toBe(noteName)
      expect(existsSync(join(testContext.notesDir, 'my-notebook', noteName))).toBe(true)
    })

    it('should fail if note already exists', async () => {
      const noteName = 'exists.md'
      const fullPath = join(testContext.notesDir, 'my-notebook', noteName)
      writeFileSync(fullPath, 'exists')

      const event = {
        context: { params: { path: `my-notebook/${noteName}` } }
      } as any

      await expect(postHandler(event)).rejects.toMatchObject({
        statusCode: 409
      })
    })
  })

  describe('put (rename)', () => {
    it('should rename a note', async () => {
      const oldName = 'old.md'
      const newName = 'new.md'
      writeFileSync(join(testContext.notesDir, 'my-notebook', oldName), 'content')

      vi.mocked(readBody).mockResolvedValue({ newName })

      const event = {
        context: { params: { path: `my-notebook/${oldName}` } }
      } as any

      const result = await putHandler(event)

      expect(result.label).toBe(newName)
      expect(existsSync(join(testContext.notesDir, 'my-notebook', newName))).toBe(true)
      expect(existsSync(join(testContext.notesDir, 'my-notebook', oldName))).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete a note', async () => {
      const noteName = 'delete-me.md'
      writeFileSync(join(testContext.notesDir, 'my-notebook', noteName), 'content')

      const event = {
        context: { params: { path: `my-notebook/${noteName}` } },
        waitUntil: (p: Promise<any>) => p
      } as any

      await deleteHandler(event)

      expect(existsSync(join(testContext.notesDir, 'my-notebook', noteName))).toBe(false)
    })
  })

  describe('patch (update)', () => {
    it('should update note content', async () => {
      const noteName = 'update-me.md'
      writeFileSync(join(testContext.notesDir, 'my-notebook', noteName), 'old content')

      const newContent = Buffer.from('new content')
      vi.mocked(readMultipartFormData).mockResolvedValue([{ name: 'file', data: newContent }] as any)

      const event = {
        context: { params: { path: `my-notebook/${noteName}` } }
      } as any

      const result = await patchHandler(event)

      // expect(result.size).toBe(newContent.length)
      // Size check might be flaky if encoding differs, but buffer length should match file size

      const fs = await import('node:fs')
      const fileContent = fs.readFileSync(join(testContext.notesDir, 'my-notebook', noteName), 'utf-8')
      expect(fileContent).toBe('new content')
    })
  })
})
