import type { ResultSet } from '@libsql/client'
import type { InsertSetting } from '~/server/db/schema'
import { settings } from '~/server/db/schema'
import { db } from '~/server/utils/drizzle'
import { defineEventHandlerWithError } from '~/server/wrappers/error'
import type { Result } from '~/types/result'

export default defineEventHandlerWithError(async (event): Promise<Result<ResultSet>> => {
  const setting = await readBody<InsertSetting>(event)

  const result = await db.insert(settings).values(setting).run()
  return {
    success: true,
    data: result
  }
})
