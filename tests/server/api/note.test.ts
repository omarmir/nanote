import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { join } from 'node:path'
import basePath from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { mkdir } from 'node:fs/promises'
import type { Note } from '~/types/notebook'

let authCookie = ''
describe('Notebook check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
    const fullPath = join(basePath, 'NoteTest')
    await mkdir(fullPath)
  })

  /**
   * Create Note
   */
  it('Response matches new note created', async () => {
    const blob = new Blob(['# Test Note'], { type: 'text/markdown' })

    const formData = new FormData()
    formData.append('file', blob, `Test.md`) // The file to upload
    formData.append('filename', `Test.md`) // The filename to use when saving

    const response = await $fetch('/api/note/NoteTest/Test', {
      method: 'POST',
      body: formData,
      headers: { Cookie: authCookie }
    })
    const resp: Note = {
      name: 'Test',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest'],
      size: 11
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })
})
