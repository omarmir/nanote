import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { DeleteNotebook, Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
import { join } from 'node:path'
import { notesPath } from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { access, mkdir, writeFile } from 'node:fs/promises'

let authCookie = ''
describe('Notebook check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    const fullPath = join(notesPath, 'Test')
    await mkdir(fullPath)

    const notePath = join(fullPath, 'Content.md')
    await writeFile(notePath, ['Content Test'])
    const notebookPath = join(fullPath, 'Initial Notebook')
    await mkdir(notebookPath)
    authCookie = await getAuthCookie()
  })

  /**
   * Notebook contents shows note created inside notebook
   */
  it('Reponse shows notebook content including the created note', async () => {
    const response = await $fetch('api/notebook/Test', { method: 'GET', headers: { Cookie: authCookie } })
    const resp: NotebookContents = {
      path: join(notesPath, 'Test'),
      notes: [
        {
          createdAt: expect.any(String),
          name: 'Content.md',
          notebook: ['Test'],
          size: 0.01171875,
          isMarkdown: true,
          updatedAt: expect.any(String)
        }
      ],
      notebooks: {
        'Initial Notebook': {
          name: 'Initial Notebook',
          createdAt: expect.any(String),
          noteCount: 0,
          notebookCount: 0,
          notebooks: ['Test'],
          updatedAt: expect.any(String),
          path: join(notesPath, 'Test', 'Initial Notebook')
        }
      },
      pathArray: ['Test']
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  /**
   * Create Notebook
   */
  it('Response matches new nested notebook created', async () => {
    const response = await $fetch('/api/notebook/Test/Nested', { method: 'POST', headers: { Cookie: authCookie } })
    const resp: Notebook = {
      notebooks: ['Test'],
      name: 'Nested',
      createdAt: expect.any(String),
      updatedAt: null,
      notebookCount: 0,
      noteCount: 0,
      path: join(notesPath, 'Test', 'Nested')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if nested folder was created', async () => {
    await expect(access(join(notesPath, 'Test', 'Nested'))).resolves.not.toThrow()
  })

  it('Response matches new nested notebook created', async () => {
    const response = await $fetch('/api/notebook/Test/Nested/Deeply', {
      method: 'POST',
      headers: { Cookie: authCookie }
    })
    const resp: Notebook = {
      notebooks: ['Test', 'Nested'],
      name: 'Deeply',
      createdAt: expect.any(String),
      updatedAt: null,
      notebookCount: 0,
      noteCount: 0,
      path: join(notesPath, 'Test', 'Nested', 'Deeply')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if nested folder was created', async () => {
    await expect(access(join(notesPath, 'Test', 'Nested', 'Deeply'))).resolves.not.toThrow()
  })

  /**
   * Rename Notebook
   */

  it('Response matches nested renamed notebook', async () => {
    const response = await $fetch('/api/notebook/Test/Nested', {
      method: 'PUT',
      headers: { Cookie: authCookie },
      body: { newName: 'NestedTested' }
    })
    const resp: RenameNotebook = {
      notebooks: ['Test'],
      oldName: 'Nested',
      newName: 'NestedTested',
      createdAt: expect.any(String),
      path: join(notesPath, 'Test', 'NestedTested'),
      updatedAt: expect.any(String)
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if renamed folder is gone', async () => {
    await expect(access(join(notesPath, 'Test', 'Nested'))).rejects.toThrow()
  })

  it('Checks if renamed folder is present', async () => {
    await expect(access(join(notesPath, 'Test', 'NestedTested'))).resolves.not.toThrow()
  })

  /**
   * Get Notebook
   */

  it('Response matches nested notebook contents', async () => {
    const response = await $fetch('/api/notebook/Test/NestedTested', {
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    const resp: NotebookContents = {
      pathArray: ['Test', 'NestedTested'],
      notes: [],
      path: join(notesPath, 'Test', 'NestedTested'),
      notebooks: {
        Deeply: {
          notebooks: ['Test', 'NestedTested'],
          name: 'Deeply',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          notebookCount: 0,
          noteCount: 0,
          path: join(notesPath, 'Test', 'NestedTested', 'Deeply')
        }
      }
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  /**
   * Delete Notebook
   */
  it('Response matches deleted nested notebook', async () => {
    const response = await $fetch('/api/notebook/Test/NestedTested', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })
    const resp: DeleteNotebook = {
      timestamp: expect.any(String),
      notebook: ['Test', 'NestedTested'],
      deleted: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if deleted nested folder is gone', async () => {
    await expect(access(join(notesPath, 'Test', 'NestedTested'))).rejects.toThrow()
  })
})
