import { defineEventHandlerWithError } from '../../wrappers/error'
import { type SelectShared, shared } from '~~/server/db/schema'

// import type { Note } from '#shared/types/notebook'

export default defineEventHandlerWithError(async (event): Promise<SelectShared[]> => {
  await authorize(event, editAllNotes)

  const t = await useTranslation(event)

  try {
    const sharedNotes = await db.select().from(shared).all()
    return sharedNotes
  } catch (dbError) {
    console.error('Database error while getting shared items:', dbError)
    // Handle potential database errors (e.g., connection issues, constraint violations)
    throw createError({
      statusCode: 500,
      statusMessage: t('errors.httpCodes.500'),
      message: t('errors.failedToFetchShared')
    })
  }
})
