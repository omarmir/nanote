import type { InsertSetting } from '~~/server/db/schema'
import { settings } from '~~/server/db/schema'
import { db } from '~~/server/utils/drizzle'
import { defineEventHandlerWithError } from '~~/server/wrappers/error'
import type { Result } from '#shared/types/result'

export default defineEventHandlerWithError(async (event): Promise<Result<null>> => {
  const setting = await readBody<InsertSetting>(event)

  await db
    .insert(settings)
    .values(setting)
    .onConflictDoUpdate({
      target: [settings.setting], // Replace 'key' with your unique column name
      set: { value: setting.value }
    })

  return {
    success: true,
    data: null
  }
})
