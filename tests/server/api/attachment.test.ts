import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import getHandler from '#server/api/attachment/[file].get'
import postHandler from '#server/api/attachment/index.post'

let testContext: ReturnType<typeof createTestContext>

vi.mock('#server/folder', () => {
  return {
    get uploadPath() {
      return testContext?.uploadsDir
    }
  }
})

// Stub readMultipartFormData
vi.stubGlobal('readMultipartFormData', vi.fn())

describe('server/api/attachment', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.resetModules()

    // Create attachments dir
    mkdirSync(join(testContext.uploadsDir, 'attachments'), { recursive: true })
  })

  afterEach(() => {
    testContext.cleanup()
  })

  describe('[file].get', () => {
    it('should return file stream if exists', async () => {
      const fileName = 'test.txt'
      const content = 'hello world'
      writeFileSync(join(testContext.uploadsDir, 'attachments', fileName), content)

      const event = {
        context: { params: { file: fileName } }
      } as any

      const result = await getHandler(event)
      // Result should be a ReadStream
      expect(result).toBeDefined()
      expect(result.path).toBeDefined()

      // Allow time for pending stream operations to settle before cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should throw 404 if file missing', async () => {
      const fileName = 'missing.txt'
      const event = {
        context: { params: { file: fileName } }
      } as any

      await expect(getHandler(event)).rejects.toMatchObject({
        statusCode: 404
      })
    })

    it('should throw 400 if file param missing', async () => {
      const event = {
        context: { params: {} }
      } as any

      await expect(getHandler(event)).rejects.toMatchObject({
        statusCode: 400
      })
    })
  })

  describe('index.post', () => {
    it('should save uploaded file', async () => {
      const fileContent = Buffer.from('uploaded content')
      const fileName = 'upload.txt'

      vi.mocked(readMultipartFormData).mockResolvedValue([
        { name: 'file', filename: fileName, data: fileContent },
        { name: 'path', data: Buffer.from('/') }
      ] as any)

      const event = {} as any
      const result = await postHandler(event)

      expect(result).toContain(fileName) // ID is prepended

      // Verify file exists
      // We need to find the file in the dir since ID is random
      const fs = await import('node:fs')
      const files = fs.readdirSync(join(testContext.uploadsDir, 'attachments'))
      expect(files.length).toBe(1)
      expect(files[0]).toContain(fileName)
    })

    it('should throw 400 if form data missing', async () => {
      vi.mocked(readMultipartFormData).mockResolvedValue(undefined)

      const event = {} as any
      await expect(postHandler(event)).rejects.toMatchObject({
        statusCode: 400
      })
    })
  })
})
