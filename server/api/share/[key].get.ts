import { defineEventHandlerWithError } from '../../wrappers/error'
import { shared } from '~~/server/db/schema'
import { join, resolve, extname } from 'node:path'
import { notesPath } from '~~/server/folder'
import { access, constants, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

export default defineEventHandlerWithError(async event => {
  const key = decodeURIComponent(event.context.params?.key ?? '')
  const t = await useTranslation(event)

  if (!key)
    throw createError({
      statusCode: 401,
      statusMessage: t('errors.httpCodes.401'),
      message: t('errors.wrongKey')
    })

  const note = await db.query.shared.findFirst({
    where: eq(shared.key, key)
  })

  if (!note) {
    throw createError({
      statusCode: 404,
      statusMessage: t('errors.httpCodes.404'),
      message: t('errors.shareDoesntExist')
    })
  }

  const userSession = await getUserSession(event)
  if (userSession.user?.role !== 'root') {
    await replaceUserSession(event, {
      user: {
        role: 'shared'
      },
      secure: {
        share: { key, apiPath: note.path }
      },
      loggedInAt: new Date()
    })
  }

  await authorize(event, viewSharedNote, note.path)

  const fullPath = resolve(join(notesPath, ...note.path.split('/')))

  try {
    // Verify notebook and note exist and is read/write allowed
    await access(fullPath, constants.R_OK | constants.W_OK)
  } catch (error) {
    console.error('Note error:', error)
    throw createError({
      statusCode: 403,
      statusMessage: t('errors.httpCodes.403'),
      message: t('errors.accessError')
    })
  }

  const stats = await stat(fullPath)

  const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime
  const createdAt = createdAtTime.toISOString()
  const updatedAt = stats.mtime.toISOString()

  // Determine content type based on file extension
  const fileExtension = extname(fullPath).toLowerCase()

  const contentType = fileExtension === '.md' ? 'text/markdown' : 'text/plain'

  const content = readFileSync(fullPath, 'utf8')

  const attachments = [...content.matchAll(fullRegex)].map(m => m[0].split('/').at(-1))

  // TODO: We need to invalidate this, it also invalidates in 24 hours to release memory
  await useStorage().setItem(`${SHARED_ATTACHMENT_PREFIX}${note.path}`, attachments, { ttl: 60 * 60 * 24 })

  appendHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${fullPath.split('/').at(-1)}"`,
    'Cache-Control': 'no-cache',
    'Content-Created': createdAt,
    'Content-Updated': updatedAt
  })

  // Return file stream
  return send(event, content)
})
