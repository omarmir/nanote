import type { Result } from '~/types/result'
import { defineEventHandlerWithError } from '../../../wrappers/error'
import { shared } from '~/server/db/schema'
// import type { Note } from '~/types/notebook'

export default defineEventHandlerWithError(async (event): Promise<Result<null>> => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Share note to be deleted is not specified.'
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
      message: `Expected to delete one share but deleted ${deleteNote.rowsAffected}`
    })
  }
})
