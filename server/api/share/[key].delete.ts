import { defineEventHandlerWithError } from '../../wrappers/error'
import { shared } from '~~/server/db/schema'

export default defineEventHandlerWithError(async event => {
  await authorize(event, editAllNotes)

  const sharingKey = decodeURIComponent(event.context.params?.key ?? '')
  const t = await useTranslation(event)

  if (!sharingKey)
    throw createError({
      statusCode: 400,
      statusMessage: t('errors.httpCodes.400'),
      message: t('errors.shareNoteNotSpecified')
    })

  try {
    const deleteNote = await db.delete(shared).where(eq(shared.key, sharingKey)).returning({ notePath: shared.path })

    for (const item of deleteNote) {
      await useStorage().removeItem(`${SHARED_ATTACHMENT_PREFIX}${item.notePath}`, { removeMeta: true })
    }

    if (deleteNote.length === 1) {
      return true
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: t('errors.httpCodes.500'),
        message: t('errors.unexpectedDeleteCount', { count: deleteNote.length })
      })
    }
  } catch (dbError) {
    console.error('Database error while deleting link:', dbError)
    // Handle potential database errors (e.g., connection issues, constraint violations)
    throw createError({
      statusCode: 500,
      statusMessage: t('errors.httpCodes.500'),
      message: t('errors.failedDeleteShareLink')
    })
  }
})
