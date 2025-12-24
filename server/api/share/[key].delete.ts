import { defineEventHandlerWithError } from '../../wrappers/error'
import { shared } from '~~/server/db/schema'

export default defineEventHandlerWithError(async (event) => {
  await waitforme(3000)
  const sharingKey = decodeURIComponent(event.context.params?.key ?? '')
  const t = await useTranslation(event)

  if (!sharingKey)
    return {
      success: false,
      message: t('errors.sharingKeyRequired')
    }

  try {
    await db.delete(shared).where(eq(shared.key, sharingKey))
    console.log('del')
    // Return success response with the generated key
    return true
  } catch (dbError) {
    console.error('Database error while deleting link:', dbError)
    // Handle potential database errors (e.g., connection issues, constraint violations)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: t('errors.failedDeleteShareLink')
    })
  }
})
