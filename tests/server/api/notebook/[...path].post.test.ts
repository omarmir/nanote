import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { Notebook } from '~/types/notebook'
import { join } from 'node:path'
import basePath from '~/server/folder'
import { getAuthCookie } from '~/tests/setup'
import { access } from 'node:fs/promises'

let authCookie = ''
describe('Notebook check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
  })

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
})
