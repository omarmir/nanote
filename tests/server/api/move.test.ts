import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { join } from 'node:path'
import { notesPath } from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { mkdir, writeFile, access, stat, rm } from 'node:fs/promises'

let authCookie = ''
describe('Move API', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
    // Setup: create source and destination notebooks and a note
    await mkdir(join(notesPath, 'MoveTestSrc'), { recursive: true })
    await mkdir(join(notesPath, 'MoveTestDest'), { recursive: true })
    await writeFile(join(notesPath, 'MoveTestSrc', 'MoveMe.md'), '# Move Me')
    await mkdir(join(notesPath, 'MoveTestNotebook'), { recursive: true })
    await writeFile(join(notesPath, 'MoveTestNotebook', 'Note.md'), '# Notebook Note')
    await mkdir(join(notesPath, 'MoveTestNotebookDest'), { recursive: true })
  })

  it('Moves a note to another notebook', async () => {
    const response = await $fetch('/api/move', {
      method: 'POST',
      body: {
        source: {
          name: 'MoveMe.md',
          notebook: ['MoveTestSrc']
        },
        destination: {
          path: 'MoveTestDest'
        }
      },
      headers: { Cookie: authCookie }
    })
    expect(response).toEqual(expect.objectContaining({ success: true, data: true }))
    // Check file moved
    await expect(access(join(notesPath, 'MoveTestDest', 'MoveMe.md'))).resolves.not.toThrow()
    await expect(access(join(notesPath, 'MoveTestSrc', 'MoveMe.md'))).rejects.toThrow()
  })

  it('Moves a notebook to another notebook', async () => {
    const response = await $fetch('/api/move', {
      method: 'POST',
      body: {
        source: {
          path: 'MoveTestNotebook'
        },
        destination: {
          path: 'MoveTestNotebookDest'
        }
      },
      headers: { Cookie: authCookie }
    })
    expect(response).toEqual(expect.objectContaining({ success: true, data: true }))
    // Check folder moved
    await expect(stat(join(notesPath, 'MoveTestNotebookDest', 'MoveTestNotebook'))).resolves.not.toThrow()
    await expect(access(join(notesPath, 'MoveTestNotebook'))).rejects.toThrow()
  })

  it('Fails to move note to same notebook', async () => {
    // Recreate file
    await writeFile(join(notesPath, 'MoveTestDest', 'MoveMe.md'), '# Move Me')
    const response = await $fetch('/api/move', {
      method: 'POST',
      body: {
        source: {
          name: 'MoveMe.md',
          notebook: ['MoveTestDest']
        },
        destination: {
          path: 'MoveTestDest'
        }
      },
      headers: { Cookie: authCookie },
      retry: false
    }).catch((e) => e.data)
    expect(response).toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  })

  it('Fails to move notebook into itself', async () => {
    // Recreate folder
    await mkdir(join(notesPath, 'MoveTestNotebookDest', 'MoveTestNotebook'), { recursive: true })
    const response = await $fetch('/api/move', {
      method: 'POST',
      body: {
        source: {
          path: 'MoveTestNotebookDest/MoveTestNotebook'
        },
        destination: {
          path: 'MoveTestNotebookDest/MoveTestNotebook'
        }
      },
      headers: { Cookie: authCookie },
      retry: false
    }).catch((e) => e.data)
    expect(response).toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  })

  it('Fails if destination exists with same name', async () => {
    // Create a file with same name in destination
    await writeFile(join(notesPath, 'MoveTestDest', 'MoveMe.md'), '# Already exists')
    // Create another file to move
    await writeFile(join(notesPath, 'MoveTestSrc', 'MoveMe.md'), '# Move Me')
    const response = await $fetch('/api/move', {
      method: 'POST',
      body: {
        source: {
          name: 'MoveMe.md',
          notebook: ['MoveTestSrc']
        },
        destination: {
          path: 'MoveTestDest'
        }
      },
      headers: { Cookie: authCookie },
      retry: false
    }).catch((e) => e.data)
    expect(response).toMatchObject({
      statusCode: 409,
      statusMessage: 'Conflict'
    })
  })

  // Cleanup
  afterAll(async () => {
    await rm(join(notesPath, 'MoveTestSrc'), { recursive: true, force: true })
    await rm(join(notesPath, 'MoveTestDest'), { recursive: true, force: true })
    await rm(join(notesPath, 'MoveTestNotebookDest'), { recursive: true, force: true })
  })
})
