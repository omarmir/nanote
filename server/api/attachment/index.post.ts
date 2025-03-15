import { customAlphabet } from 'nanoid'
import { writeFile, mkdir, constants } from 'node:fs/promises'
import path from 'node:path'
import { access, existsSync } from 'node:fs'
import { uploadPath } from '~/server/folder'
import { defineEventHandlerWithStorage } from '~/server/wrappers/storage'
import type { MultiPartData, UploadItem } from '~/types/upload'
// import { waitforme } from '~/server/utils'

export default defineEventHandlerWithStorage(async (event, storage) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Missing form data'
      })
    }

    // await waitforme(5000)

    const { fileEntry, pathEntry } = formData.reduce(
      (acc, entry) => {
        if (entry.name === 'file') acc.fileEntry = entry
        if (entry.name === 'path') acc.pathEntry = entry
        return acc
      },
      {} as { fileEntry?: MultiPartData; pathEntry?: MultiPartData }
    )

    if (!fileEntry?.data || !pathEntry?.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'No file uploaded or note path unspecified'
      })
    }

    const attachBasePath = path.join(uploadPath, 'attachments')
    if (!existsSync(attachBasePath)) {
      await mkdir(attachBasePath, { recursive: true })
    }

    access(attachBasePath, constants.R_OK | constants.W_OK, (err) => {
      if (err) {
        console.log(err)
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
          message: 'Attachment folder is not read/write accessible.'
        })
      }
    })

    const nanoid = customAlphabet('abcdefghijklmop')
    const id = nanoid()
    const fileName = `${id}_${fileEntry.filename?.replace(/[\\/:*?"<>]/g, '')}`

    if (fileName.length > 255) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Filename ${fileName} will exceed allowed length of 255 characters.`
      })
    }

    const attachPath = path.join(attachBasePath, fileName)

    const isWindows = process.platform === 'win32'
    const maxPathLength = isWindows ? 259 : 4095 // Same limits as folder creation
    if (attachPath.length > maxPathLength) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Attachment file path is going to exceed maximum path length for your operating system.'
      })
    }

    let uploads = await storage.getItem<UploadItem[]>('uploads')
    if (!uploads || uploads === null) uploads = []
    await writeFile(attachPath, fileEntry.data)
    uploads.push({ path: pathEntry.data.toString(), fileName })
    await storage.setItem('uploads', uploads)
    return `/api/attachment/${fileName}`
  } catch (error) {
    console.error('Error serving file:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `Failed to retrieve file: ${error}`
    })
  }
})
