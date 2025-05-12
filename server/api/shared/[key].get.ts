import { defineEventHandlerWithError } from '../../wrappers/error'
import { shared } from '~/server/db/schema'
// import type { Note } from '~/types/notebook'

export default defineEventHandlerWithError(async (event) => {
  const key = decodeURIComponent(event.context.params?.key ?? '')

  if (!key)
    return {
      success: false,
      message: 'Sharing key is required'
    }

  const resp = await db.select().from(shared).where(eq(shared.key, key))

  if (resp.length === 0) {
    return {
      success: false,
      message: 'No shared note found'
    }
  }

  return {
    success: true,
    data: resp
  }
})
