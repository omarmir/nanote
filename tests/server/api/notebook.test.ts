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

vi.stubGlobal('readBody', vi.fn())

import postHandler from '#server/api/notebook/[...path].post'
import putHandler from '#server/api/notebook/[...path].put'
import deleteHandler from '#server/api/notebook/[...path].delete'
import getHandler from '#server/api/notebook/[...path].get'

describe('server/api/notebook', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules()
  })

  afterEach(() => {
    testContext.cleanup()
  })

  describe('post (create)', () => {
    it('should create a new notebook', async () => {
      const notebookName = 'NewNotebook'
      // vi.mocked(readBody).mockResolvedValue({ notebookName }) // Not used since path param is key

      const event = {
        context: { params: { path: notebookName } }
      } as any

      const result = await postHandler(event)

      expect(result.label).toBe(notebookName)
      expect(existsSync(join(testContext.notesDir, notebookName))).toBe(true)
    })

    it('should fail if exists', async () => {
      const notebookName = 'Existing'
      mkdirSync(join(testContext.notesDir, notebookName))

      const event = {
        context: { params: { path: notebookName } }
      } as any

      await expect(postHandler(event)).rejects.toMatchObject({
        statusCode: 409
      })
    })
  })

  describe('put (rename)', () => {
    it('should rename a notebook', async () => {
      const oldName = 'OldNotebook'
      const newName = 'NewNotebook'
      mkdirSync(join(testContext.notesDir, oldName))

      vi.mocked(readBody).mockResolvedValue({ newName })

      const event = {
        context: { params: { path: oldName } }
      } as any

      const result = await putHandler(event)

      expect(result.label).toBe(newName)
      expect(existsSync(join(testContext.notesDir, newName))).toBe(true)
      expect(existsSync(join(testContext.notesDir, oldName))).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete a notebook', async () => {
      const notebookName = 'DeleteMe'
      mkdirSync(join(testContext.notesDir, notebookName))
      // Add a file inside
      writeFileSync(join(testContext.notesDir, notebookName, 'note.md'), 'content')

      const event = {
        context: { params: { path: notebookName } }
      } as any

      const result = await deleteHandler(event)

      expect(result).toBe(true)
      expect(existsSync(join(testContext.notesDir, notebookName))).toBe(false)
    })
  })

  describe('get (list)', () => {
    it('should list notebook contents', async () => {
      const notebookName = 'MyNotebook'
      mkdirSync(join(testContext.notesDir, notebookName))
      writeFileSync(join(testContext.notesDir, notebookName, 'note1.md'), 'c1')
      writeFileSync(join(testContext.notesDir, notebookName, 'note2.md'), 'c2')

      const event = {
        context: { params: { path: notebookName } }
      } as any

      const result = await getHandler(event)

      expect(result).toHaveLength(2)
      expect(result.map(i => i.label)).toContain('note1.md')
      expect(result.map(i => i.label)).toContain('note2.md')
    })
  })
})
