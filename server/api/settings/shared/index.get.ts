import { defineEventHandlerWithError } from '../../../wrappers/error'
import { type SelectShared, shared } from '~/server/db/schema'

// import type { Note } from '~/types/notebook'

export default defineEventHandlerWithError(async (): Promise<SelectShared[]> => {
  const sharedNotes = await db.select().from(shared).all()

  return sharedNotes
})
