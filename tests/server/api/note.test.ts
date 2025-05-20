import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { join } from 'node:path'
import { notesPath } from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { access, mkdir } from 'node:fs/promises'
import type { DeleteNote, Note, NoteResponse, RenameNote } from '~/types/notebook'

let authCookie = ''
describe('Note check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
    const fullPath = join(notesPath, 'NoteTest')
    await mkdir(fullPath)
    const nestedPath = join(notesPath, 'NoteTest', 'Nested')
    await mkdir(nestedPath)
  })

  /**
   * Create Note
   * Create Nested Note
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
      name: 'Test.md',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest'],
      size: 11,
      isMarkdown: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if note was created', async () => {
    await expect(access(join(notesPath, 'NoteTest', 'Test.md'))).resolves.not.toThrow()
  })

  it('Response matches new nested note created', async () => {
    const blob = new Blob(['# Test Note'], { type: 'text/markdown' })

    const formData = new FormData()
    formData.append('file', blob, `Test.md`) // The file to upload
    formData.append('filename', `Test.md`) // The filename to use when saving

    const response = await $fetch('/api/note/NoteTest/Nested/Test', {
      method: 'POST',
      body: formData,
      headers: { Cookie: authCookie }
    })
    const resp: Note = {
      name: 'Test.md',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest', 'Nested'],
      size: 11,
      isMarkdown: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if nested note was created', async () => {
    await expect(access(join(notesPath, 'NoteTest', 'Nested', 'Test.md'))).resolves.not.toThrow()
  })

  /**
   * Read note
   * Read nested note
   */

  it('Response matches note', async () => {
    const response = await $fetch('/api/note/NoteTest/Test.md', {
      headers: { Cookie: authCookie }
    })
    const resp: Note = {
      name: 'Test.md',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest'],
      size: 11,
      isMarkdown: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Response matches nested note', async () => {
    const response = await $fetch('/api/note/NoteTest/Nested/Test.md', {
      headers: { Cookie: authCookie }
    })
    const resp: Note = {
      name: 'Test.md',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest', 'Nested'],
      size: 11,
      isMarkdown: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Response matches note content', async () => {
    const response = await $fetch('/api/note/download/NoteTest/Nested/Test.md', {
      headers: { Cookie: authCookie }
    })
    expect(response).toEqual(expect.stringMatching('# Test Note'))
  })

  /**
   * Update note
   */
  it('Response matches updated note', async () => {
    const blob = new Blob(['# Updated'], { type: 'text/markdown' })

    const formData = new FormData()
    formData.append('file', blob, `Test.md`) // The file to upload
    formData.append('filename', `Test.md`) // The filename to use when saving

    const response = await $fetch('/api/note/NoteTest/Nested/Test.md', {
      method: 'PATCH',
      body: formData,
      headers: { Cookie: authCookie }
    })

    const resp: NoteResponse = {
      notebook: ['NoteTest', 'Nested'],
      note: 'Test.md',
      path: join(notesPath, 'NoteTest', 'Nested', 'Test.md'),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      size: expect.any(Number),
      originalFilename: 'Test.md'
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  /**
   * Rename Note
   */
  it('Response matches renamed note', async () => {
    const response = await $fetch('/api/note/NoteTest/Test.md', {
      method: 'PUT',
      body: { newName: 'TestRenamed.md' },
      headers: { Cookie: authCookie }
    })

    const resp: RenameNote = {
      oldName: 'Test.md',
      newName: 'TestRenamed.md',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      notebook: ['NoteTest']
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if renamed folder is gone', async () => {
    await expect(access(join(notesPath, 'NoteTest', 'Test.md'))).rejects.toThrow()
  })

  it('Checks if note was renamed', async () => {
    await expect(access(join(notesPath, 'NoteTest', 'TestRenamed.md'))).resolves.not.toThrow()
  })

  /**
   * Delete note
   */

  it('Response deleted note', async () => {
    const response = await $fetch('/api/note/NoteTest/Nested/Test.md', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })
    const resp: DeleteNote = {
      name: 'Test.md',
      timestamp: expect.any(String),
      notebook: ['NoteTest', 'Nested'],
      deleted: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if note is deleted', async () => {
    await expect(access(join(notesPath, 'NoteTest', 'Nested', 'Test.md'))).rejects.toThrow()
  })
})
