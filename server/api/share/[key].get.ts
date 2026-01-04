import { defineEventHandlerWithError } from '../../wrappers/error'
import { shared } from '~~/server/db/schema'
import { join, resolve, extname } from 'node:path'
import { notesPath } from '~~/server/folder'
import { access, constants, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

// eslint-disable-next-line local/require-authorize  local/require-authorize
export default defineEventHandlerWithError(async event => {
  const key = decodeURIComponent(event.context.params?.key ?? '')
  const t = await useTranslation(event)

  if (!key)
    return {
      success: false,
      message: 'Sharing key is required'
    }

  const note = await db.query.shared.findFirst({
    where: eq(shared.key, key)
  })

  if (!note) {
    return {
      success: false,
      message: 'No shared note found'
    }
  }

  const fullPath = resolve(join(notesPath, ...note.path.split('/')))

  try {
    // Verify notebook and note exist and is read/write allowed
    await access(fullPath, constants.R_OK | constants.W_OK)
  } catch (error) {
    console.error('Note error:', error)
    const message = 'Access error: Applicaiton does not have access to the note or is no longer on filesystem.'
    throw createError({
      statusCode: 404,
      statusMessage: t('errors.httpCodes.404'),
      message
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

  // const result = content.matchAll(fullRegex)
  // const attachments = Array.from(result, (match) => match[0].split('/').at(-1))

  // const token = jwt.sign({ app: 'nanote', attachments }, SECRET_KEY, { expiresIn: '1d', audience: 'shared' })

  // setCookie(event, 'token', token, {
  //   httpOnly: true,
  //   sameSite: 'strict',
  //   maxAge: 3600 * 24 * 1, // 1 day
  //   path: '/'
  // })

  // Set appropriate headers
  setHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${fullPath.split('/').at(-1)}"`,
    'Cache-Control': 'no-cache',
    'Content-Created': createdAt,
    'Content-Updated': updatedAt
  })

  // Return file stream
  return send(event, content)
})
