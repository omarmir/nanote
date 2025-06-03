import type { ReadStream } from 'node:fs'
import { createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { uploadPath } from '~/server/folder'
import mime from 'mime'
import { defineEventHandlerWithAttachmentAuthError } from '~/server/wrappers/attachment-auth'

export default defineEventHandlerWithAttachmentAuthError(async (event): Promise<ReadStream> => {
  const file = event.context.params?.file

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No file specified'
    })
  }
  // Construct the path to your file. Adjust the base folder as needed.
  const filePath = resolve(uploadPath, 'attachments', decodeURIComponent(file))

  // Check if the file exists
  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }

  const mimeType = mime.getType(filePath) || 'application/octet-stream'

  setHeaders(event, {
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename="${file}"`,
    'Cache-Control': 'no-cache'
  })

  // Stream the file back as the response
  return createReadStream(filePath)
})
