import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { notesPath, uploadPath } from '~/server/folder'
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

  const storage = createStorage({
    driver: fsDriver({ base: uploadPath })
  })

  beforeAll(async () => {
    authCookie = await getAuthCookie()
  })

  it('Uploads a file and responds with the absolute path', async () => {
    const blob = new Blob([`Test Upload`], { type: 'text' })

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
    let uploads = await storage.getItem<UploadItem[]>('uploads')
    if (!uploads || uploads === null) uploads = []
    const fileName = apiFilePath.split('/').at(-1) ?? ''

    const resp: UploadItem = { path: '/notes/test', fileName, deleted: false }

    expect(uploads).toEqual(expect.arrayContaining([resp]))
  })

  it('Marks attachment for deletion', async () => {
    const fileName = `upload.txt`

    //Create notebook
    const fullPath = join(notesPath, 'TestUpload')
    await mkdir(fullPath)

    //Create note
    const notePath = join(fullPath, 'TestUpload.md')
    await writeFile(notePath, [`# Test Note ::file{href="${fileName}" title="upload.txt"}`])

    // create attachments
    const attachmentBlob = new Blob([`Test Upload`], { type: 'text' })
    const attachmentFormData = new FormData()
    attachmentFormData.append('file', attachmentBlob, fileName) // The file to upload
    attachmentFormData.append('path', 'TestUpload/TestUpload') // The filename to use when saving
    const resp = await $fetch<string>('/api/attachment', {
      method: 'POST',
      body: attachmentFormData,
      headers: { Cookie: authCookie }
    })

    const uploadedFileName = resp.split('/').at(-1) ?? ''

    //Send note update
    const blob = new Blob(['# Updated'], { type: 'text/markdown' })
    const formData = new FormData()
    formData.append('file', blob, `TestUpload.md`) // The file to upload
    formData.append('filename', `TestUpload.md`) // The filename to use when saving

    await $fetch('/api/note/TestUpload/TestUpload', {
      method: 'PATCH',
      body: formData,
      headers: { Cookie: authCookie }
    })

    let uploads = await storage.getItem<UploadItem[]>('uploads')
    if (!uploads || uploads === null) uploads = []

    const uploadedItem: UploadItem = { path: 'TestUpload/TestUpload', fileName: uploadedFileName, deleted: true }

    // Delay for 2 seconds - just to make sure its cleared the queue
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const arrayItem = uploads.find(
      (item) => item.path === uploadedItem.path && item.fileName === uploadedFileName && item.deleted === true
    )
    expect(arrayItem).not.toBeUndefined()
  })

  it('Marks all attachments for deletion', async () => {
    const fileName = 'upload.txt'
    //Create notebook
    const fullPath = join(notesPath, 'TestUploadAll')
    await mkdir(fullPath)

    //Create note
    const notePath = join(fullPath, 'TestUploadAll.md')
    await writeFile(notePath, [`# Test Note`])

    // create attachments
    const attachmentBlob = new Blob([`Test Upload`], { type: 'text' })
    const attachmentFormData = new FormData()
    attachmentFormData.append('file', attachmentBlob, fileName) // The file to upload
    attachmentFormData.append('path', 'TestUploadAll/TestUploadAll') // The filename to use when saving

    await $fetch<string>('/api/attachment', {
      method: 'POST',
      body: attachmentFormData,
      headers: { Cookie: authCookie }
    })

    await $fetch<string>('/api/attachment', {
      method: 'POST',
      body: attachmentFormData,
      headers: { Cookie: authCookie }
    })

    //Send note update
    const blob = new Blob(['# Updated'], { type: 'text/markdown' })
    const formData = new FormData()
    formData.append('file', blob, `TestUploadAll.md`) // The file to upload
    formData.append('filename', `TestUploadAll.md`) // The filename to use when saving

    await $fetch('/api/note/TestUploadAll/TestUploadAll', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })

    let uploads = await storage.getItem<UploadItem[]>('uploads')
    if (!uploads || uploads === null) uploads = []

    // Delay for 2 seconds - just to make sure its cleared the queue
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const arrayItem = uploads.filter((item) => item.path === 'TestUploadAll/TestUploadAll' && item.deleted === true)
    expect(arrayItem.length).toEqual(2)
  })
})
