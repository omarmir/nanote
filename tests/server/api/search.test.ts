import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { join } from 'node:path'
import basePath from '~/server/folder'
import { mkdir, writeFile } from 'node:fs/promises'
import { nanoid } from 'nanoid'
import type { SearchResult } from '~/types/notebook'
describe('Health check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  let authCookie = ''
  const nanoidString = nanoid()
  const notebookName = nanoid()
  const fileName = nanoid()

  beforeAll(async () => {
    authCookie = await getAuthCookie()
    const fullPath = join(basePath, notebookName)
    await mkdir(fullPath)

    // create file
    let fileContent = Buffer.from('')
    fileContent = Buffer.from(nanoidString)
    const filePath = join(basePath, notebookName, `${fileName}.md`)
    await writeFile(filePath, fileContent)
  })

  it('Response matches content search', async () => {
    const response = await $fetch('/api/search', {
      query: { q: nanoidString },
      headers: { Cookie: authCookie }
    })
    const resp: SearchResult[] = [
      {
        notebook: [notebookName],
        name: fileName,
        matchType: 'content',
        snippet: nanoidString,
        score: 3
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })

  it('Response matches note name', async () => {
    const response = await $fetch('/api/search', {
      query: { q: fileName },
      headers: { Cookie: authCookie }
    })
    const resp: SearchResult[] = [
      {
        notebook: [notebookName],
        name: fileName,
        matchType: 'note',
        snippet: `Note name contains "${fileName}"`,
        score: 2
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })

  it('Response matches notebook name', async () => {
    const response = await $fetch('/api/search', {
      query: { q: notebookName },
      headers: { Cookie: authCookie }
    })
    const resp: SearchResult[] = [
      {
        notebook: [notebookName],
        name: notebookName,
        matchType: 'folder',
        snippet: `Notebook name contains "${notebookName}"`,
        score: 1
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })
})
