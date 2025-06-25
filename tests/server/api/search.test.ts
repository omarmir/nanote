import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { join } from 'node:path'
import { notesPath } from '~/server/folder'
import { mkdir, writeFile } from 'node:fs/promises'
import { nanoid } from 'nanoid'
import type { USearchResult } from '~/types/ugrep'

describe('Fuzzy searching', async () => {
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
    const fullPath = join(notesPath, notebookName)
    await mkdir(fullPath)

    // create file
    let fileContent = Buffer.from('')
    fileContent = Buffer.from(nanoidString)
    const filePath = join(notesPath, notebookName, `${fileName}.md`)
    await writeFile(filePath, fileContent)
  })

  it('Response matches content search', async () => {
    const response = await $fetch('/api/search', {
      query: { q: nanoidString },
      headers: { Cookie: authCookie }
    })
    const resp: USearchResult[] = [
      {
        notebook: [notebookName],
        name: `${fileName}.md`,
        matchType: 'content',
        snippet: nanoidString,
        score: 100,
        lineNum: 1
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })

  it('Response matches note name', async () => {
    const response = await $fetch('/api/search', {
      query: { q: fileName },
      headers: { Cookie: authCookie }
    })
    const resp: USearchResult[] = [
      {
        notebook: [notebookName],
        name: `${fileName}.md`,
        matchType: 'note',
        snippet: `Note name contains "${fileName}"`,
        score: 100,
        lineNum: 0
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })

  it('Response matches notebook name', async () => {
    const response = await $fetch('/api/search', {
      query: { q: notebookName },
      headers: { Cookie: authCookie }
    })
    const resp: USearchResult[] = [
      {
        notebook: [],
        name: notebookName,
        matchType: 'folder',
        lineNum: 0,
        snippet: `Notebook name contains "${notebookName}"`,
        score: 100
      }
    ]

    expect(response).toEqual(expect.arrayContaining(resp))
  })
})
