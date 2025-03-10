import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { DeleteNotebook, Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
import { join } from 'node:path'
import basePath from '~/server/folder'
import { emptyFolder, getAuthCookie } from '~/tests/setup'
import { access } from 'node:fs/promises'

let authCookie = ''
describe('Notebook check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    await emptyFolder(basePath)
    authCookie = await getAuthCookie()
  })

  /**
   * Create Notebook
   * Create Nested Notebook
   */
  it('Response matches new notebook created', async () => {
    const response = await $fetch('/api/notebook/Test', { method: 'POST', headers: { Cookie: authCookie } })
    const resp: Notebook = {
      notebooks: [],
      name: 'Test',
      createdAt: expect.any(String),
      updatedAt: null,
      notebookCount: 0,
      noteCount: 0,
      path: join(basePath, 'Test')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if folder was created', async () => {
    await expect(access(join(basePath, 'Test'))).resolves.not.toThrow()
  })

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

  /**
   * Rename Notebook
   * Rename Nested Notebook
   */

  it('Response matches renamed notebook', async () => {
    const response = await $fetch('/api/notebook/Test', {
      method: 'PUT',
      headers: { Cookie: authCookie },
      body: { newName: 'TestedName' }
    })
    const resp: RenameNotebook = {
      notebooks: [],
      oldName: 'Test',
      newName: 'TestedName',
      createdAt: expect.any(String),
      path: join(basePath, 'TestedName'),
      updatedAt: expect.any(String)
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if renamed folder is gone', async () => {
    await expect(access(join(basePath, 'Test'))).rejects.toThrow()
  })

  it('Checks if renamed folder is present', async () => {
    await expect(access(join(basePath, 'TestedName'))).resolves.not.toThrow()
  })

  it('Response matches nested renamed notebook', async () => {
    const response = await $fetch('/api/notebook/TestedName/Nested', {
      method: 'PUT',
      headers: { Cookie: authCookie },
      body: { newName: 'NestedTested' }
    })
    const resp: RenameNotebook = {
      notebooks: ['TestedName'],
      oldName: 'Nested',
      newName: 'NestedTested',
      createdAt: expect.any(String),
      path: join(basePath, 'TestedName', 'NestedTested'),
      updatedAt: expect.any(String)
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if renamed folder is gone', async () => {
    await expect(access(join(basePath, 'TestedName', 'Nested'))).rejects.toThrow()
  })

  it('Checks if renamed folder is present', async () => {
    await expect(access(join(basePath, 'TestedName', 'NestedTested'))).resolves.not.toThrow()
  })

  /**
   * Get Notebook
   * Get Nested Notebook
   */

  it('Response matches notebook contents', async () => {
    const response = await $fetch('/api/notebook/TestedName', {
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    const resp: NotebookContents = {
      pathArray: ['TestedName'],
      notes: [],
      path: join(basePath, 'TestedName'),
      notebooks: {
        NestedTested: {
          notebooks: ['TestedName'],
          name: 'NestedTested',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          notebookCount: 0,
          noteCount: 0,
          path: join(basePath, 'TestedName', 'NestedTested')
        }
      }
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Response matches nested notebook contents', async () => {
    const response = await $fetch('/api/notebook/TestedName/NestedTested', {
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    const resp: NotebookContents = {
      pathArray: ['TestedName', 'NestedTested'],
      notes: [],
      path: join(basePath, 'TestedName', 'NestedTested')
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  /**
   * Delete Nested Notebook
   * Delete Notebook
   */
  it('Response matches deleted nested notebook', async () => {
    const response = await $fetch('/api/notebook/TestedName/NestedTested', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })
    const resp: DeleteNotebook = {
      timestamp: expect.any(String),
      notebook: ['TestedName', 'NestedTested'],
      deleted: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if deleted nested folder is gone', async () => {
    await expect(access(join(basePath, 'TestedName', 'NestedTested'))).rejects.toThrow()
  })

  it('Response matches deleted nested notebook', async () => {
    const response = await $fetch('/api/notebook/TestedName', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })
    const resp: DeleteNotebook = {
      timestamp: expect.any(String),
      notebook: ['TestedName'],
      deleted: true
    }
    expect(response).toEqual(expect.objectContaining(resp))
  })

  it('Checks if deleted nested folder is gone', async () => {
    await expect(access(join(basePath, 'TestedName'))).rejects.toThrow()
  })
})
