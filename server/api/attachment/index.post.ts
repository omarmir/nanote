import { customAlphabet } from 'nanoid'
import { writeFile, mkdir, constants } from 'node:fs/promises'
import path from 'node:path'
import { access, existsSync } from 'node:fs'
import { uploadPath } from '~~/server/folder'
import type { MultiPartData } from '#shared/types/upload'
import { defineEventHandlerWithError } from '~~/server/wrappers/error'

export default defineEventHandlerWithError(async event => {
  await authorize(event, editAllNotes)

  const formData = await readMultipartFormData(event)
  const t = await useTranslation(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.missingFormData')
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
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.noFileOrPath')
    })
  }

  const attachBasePath = path.join(uploadPath, 'attachments')
  if (!existsSync(attachBasePath)) {
    await mkdir(attachBasePath, { recursive: true })
  }

  access(attachBasePath, constants.R_OK | constants.W_OK, err => {
    if (err) {
      console.log(err)
      throw createError({
        statusCode: 401,
        statusMessage: t('errors.httpCodes.401'),
        message: t('errors.attachmentNotWritable')
      })
    }
  })

  const nanoid = customAlphabet('abcdefghijklmop')
  const id = nanoid()
  const fileName = `${id}_${fileEntry.filename?.replace(/[\\/:*?"<>]/g, '')}`

  if (fileName.length > 255) {
    throw createError({
      statusCode: 400,
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.fileNameExceed', { fileName })
    })
  }

  const attachPath = path.join(attachBasePath, fileName)

  const isWindows = process.platform === 'win32'
  const maxPathLength = isWindows ? 259 : 4095 // Same limits as folder creation
  if (attachPath.length > maxPathLength) {
    throw createError({
      statusCode: 400,
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.pathWillExceedOS')
    })
  }

  await writeFile(attachPath, fileEntry.data)
  return `/api/attachment/${fileName}`
})
