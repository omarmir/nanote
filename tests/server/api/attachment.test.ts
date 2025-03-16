import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { uploadPath } from '~/server/folder'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import type { UploadItem } from '~/types/upload'

let authCookie = ''
let apiFilePath = ''
describe('Attachments upload and view', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
  })

  it('Uploads a file and responds with the absolute path', async () => {
    const blob = new Blob(['Test Upload'], { type: 'text' })

    const formData = new FormData()
    formData.append('file', blob, 'upload.txt') // The file to upload
    formData.append('path', '/notes/test') // The filename to use when saving

    const response = await $fetch<string>('/api/attachment', {
      method: 'POST',
      body: formData,
      headers: { Cookie: authCookie }
    })

    const regex = /\/api\/attachment\/[a-p]{21}_upload.txt/g

    apiFilePath = response

    expect(response.match(regex)?.length).toBe(1)
  })

  it('Checks if uploaded file was created', async () => {
    const fileName = apiFilePath.split('/').at(-1) ?? ''
    await expect(access(join(uploadPath, 'attachments', fileName))).resolves.not.toThrow()
  })

  it('Retrieves uploaded file', async () => {
    const response = await $fetch(apiFilePath, {
      method: 'GET',
      headers: { Cookie: authCookie }
    })

    expect(response).toEqual('Test Upload')
  })

  it('Adds entry to the kv store', async () => {
    const storage = createStorage({
      driver: fsDriver({ base: uploadPath })
    })

    let uploads = await storage.getItem<UploadItem[]>('uploads')
    if (!uploads || uploads === null) uploads = []
    const fileName = apiFilePath.split('/').at(-1) ?? ''

    const resp: UploadItem = { path: '/notes/test', fileName, deleted: false }

    expect(uploads).toEqual(expect.arrayContaining([resp]))
  })
})
