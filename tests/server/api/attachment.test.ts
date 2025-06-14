// @vitest-environment nuxt
import { beforeAll, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { access, constants, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { notesPath, uploadPath } from '~/server/folder'
import { describe } from 'node:test'

let authCookie = ''
let apiFilePath = ''

describe('Attachments upload and view', async () => {
  await setup({})

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

  it('Deletes attachment on note update where attachment is removed', async () => {
    const fileName = `upload.txt`

    //Create notebook
    const fullPath = join(notesPath, 'TestUpload')
    await mkdir(fullPath)

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

    //Create note
    const notePath = join(fullPath, 'TestUpload.md')
    await writeFile(notePath, [`# Test Note ::file{href="${resp}" title="upload.txt"}`])

    const uploadedFileName = resp.split('/').at(-1) ?? ''

    //Send note update
    const blob = new Blob(['# Updated'], { type: 'text/markdown' })
    const formData = new FormData()
    formData.append('file', blob, `TestUpload.md`) // The file to upload
    formData.append('filename', `TestUpload.md`) // The filename to use when saving

    await $fetch('/api/note/TestUpload/TestUpload.md', {
      method: 'PATCH',
      body: formData,
      headers: { Cookie: authCookie }
    })

    // Delay for 2 seconds - just to make sure its cleared the queue
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const filePath = join(uploadPath, 'attachments', uploadedFileName)
    await expect(access(filePath, constants.R_OK | constants.W_OK)).rejects.toThrow()
  })

  it('Deletes all attachments belonging to a deleted note', async () => {
    const fileName = 'upload.txt'

    //Create notebook
    const fullPath = join(notesPath, 'TestUploadAll')
    await mkdir(fullPath)

    // create attachments
    const attachmentBlob = new Blob([`Test Upload`], { type: 'text' })
    const attachmentFormData = new FormData()
    attachmentFormData.append('file', attachmentBlob, fileName) // The file to upload
    attachmentFormData.append('path', 'TestUploadAll/TestUploadAll') // The filename to use when saving

    const resp = await $fetch<string>('/api/attachment', {
      method: 'POST',
      body: attachmentFormData,
      headers: { Cookie: authCookie }
    })

    //Create note
    const notePath = join(fullPath, 'TestUploadAll.md')
    await writeFile(notePath, [`# Test Note ::file{href="${resp}" title="upload.txt"}`])

    const uploadedFileName = resp.split('/').at(-1) ?? ''

    await $fetch('/api/note/TestUploadAll/TestUploadAll.md', {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    })

    // Delay for 2 seconds - just to make sure its cleared the queue
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const filePath = join(uploadPath, 'attachments', uploadedFileName)
    await expect(access(filePath, constants.R_OK | constants.W_OK)).rejects.toThrow()
  })
})
