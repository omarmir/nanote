import { createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { uploadPath } from '~~/server/folder'
import mime from 'mime'
import { defineEventHandlerWithError } from '~~/server/wrappers/error'

export default defineEventHandlerWithError(async event => {
  const file = event.context.params?.file

  const headerToken = getRequestHeader(event, 'Cookie')
  console.log('cookie', headerToken)

  if (!file) {
    const t = await useTranslation(event)
    throw createError({
      statusCode: 400,
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.missingFileParam')
    })
  }

  const fileName = decodeURIComponent(file)

  const userSession = await getUserSession(event)

  if (!userSession.user) {
    const headerToken = getRequestHeader(event, 'x-pdf-token')
    const validToken = headerToken ? await verifyPdfToken(headerToken) : false

    await authorize(event, viewAttachment, fileName, { validToken })
  } else if (userSession.user.role === 'shared') {
    // @ts-expect-error - not sure why it doesnt see it here
    const notePath = userSession.secure?.share?.apiPath

    const attachments = notePath ? await useStorage().hasItem(`${SHARED_ATTACHMENT_PREFIX}${notePath}`) : []

    const shared = { attachments, apiPath: notePath }

    await authorize(event, viewAttachment, fileName, { shared })
  }

  // Construct the path to your file. Adjust the base folder as needed.
  const filePath = resolve(uploadPath, 'attachments', fileName)

  // Check if the file exists
  if (!existsSync(filePath)) {
    const t = await useTranslation(event)
    throw createError({
      statusCode: 404,
      statusMessage: t('errors.httpCodes.404'),
      message: t('errors.fileDoesNotExist')
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
