import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { DeleteNotebook, Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
import { join } from 'node:path'
import basePath from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { access, mkdir } from 'node:fs/promises'

let authCookie = ''
describe('Notebook check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    const fullPath = join(basePath, 'Test')
    await mkdir(fullPath)
    authCookie = await getAuthCookie()
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
      path: join(basePath, 'Test', 'Nested')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if nested folder was created', async () => {
    await expect(access(join(basePath, 'Test', 'Nested'))).resolves.not.toThrow()
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
      path: join(basePath, 'Test', 'Nested', 'Deeply')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if nested folder was created', async () => {
    await expect(access(join(basePath, 'Test', 'Nested', 'Deeply'))).resolves.not.toThrow()
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
      path: join(basePath, 'Test', 'NestedTested'),
      updatedAt: expect.any(String)
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if renamed folder is gone', async () => {
    await expect(access(join(basePath, 'Test', 'Nested'))).rejects.toThrow()
  })

  it('Checks if renamed folder is present', async () => {
    await expect(access(join(basePath, 'Test', 'NestedTested'))).resolves.not.toThrow()
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
      path: join(basePath, 'Test', 'NestedTested'),
      notebooks: {
        Deeply: {
          notebooks: ['Test', 'NestedTested'],
          name: 'Deeply',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          notebookCount: 0,
          noteCount: 0,
          path: join(basePath, 'Test', 'NestedTested', 'Deeply')
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
    await expect(access(join(basePath, 'Test', 'NestedTested'))).rejects.toThrow()
  })
})
