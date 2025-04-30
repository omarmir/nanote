import { defineEventHandlerWithError } from '~/server/wrappers/error'
import type { Result } from '~/types/result'

export default defineEventHandlerWithError(async (event): Promise<Result<boolean>> => {
  const db = useDatabase()
})
