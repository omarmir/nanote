import type { Result } from '#shared/types/result'
import { defineEventHandlerWithError } from '../../../wrappers/error'
import { shared } from '~~/server/db/schema'
// import type { Note } from '#shared/types/notebook'

export default defineEventHandlerWithError(async (event): Promise<Result<null>> => {
  const t = await useTranslation(event)
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: t('errors.shareNoteNotSpecified')
    })
  }

  const deleteNote = await db.delete(shared).where(eq(shared.key, key))

  if (deleteNote.rowsAffected === 1) {
    return {
      success: true,
      data: null
    }
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: t('errors.unexpectedDeleteCount', { count: deleteNote.rowsAffected })
    })
  }
})
