import { access, constants } from 'node:fs/promises'
import { resolve } from 'node:path'
import { uploadPath } from '~/server/folder'
import { defineEventHandlerWithAttachmentAuthError } from '~/server/wrappers/attachment-auth'

// This route is used by the milkdown plugin to see if the attachment is accessible
export default defineEventHandlerWithAttachmentAuthError(async (event) => {
  const query = getQuery(event)
  const fileURL = query.url as string

  if (!fileURL) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No file specified in query parameters'
    })
  }

  const fileName = fileURL.split('/').at(-1)

  if (!fileName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Unable to get file name from the query parameters'
    })
  }

  const filePath = resolve(uploadPath, 'attachments', decodeURIComponent(fileName))

  await access(filePath, constants.R_OK | constants.W_OK) // Make sure its readable and writable

  return {
    exists: true
  }
})
