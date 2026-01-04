import type { SelectSetting } from '~~/server/db/schema'
import { settings } from '~~/server/db/schema'
import { db } from '~~/server/utils/drizzle'
import { defineEventHandlerWithError } from '~~/server/wrappers/error'
import type { Result } from '#shared/types/result'

export default defineEventHandlerWithError(async (event): Promise<Result<SelectSetting[]>> => {
  await authorize(event, editAllNotes)

  const resp = await db.select().from(settings).all()
  return {
    success: true,
    data: resp
  }
})
