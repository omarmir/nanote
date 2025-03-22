import { defineEventHandlerWithError } from '~/server/wrappers/error'
import type { Result } from '~/types/result'

export default defineEventHandlerWithError(async (event): Promise<Result<boolean>> => {
  event.context.$attachment.deleteMarkedFiles()

  const result: Result<boolean> = {
    success: true,
    data: true
  }

  // Stream the file back as the response
  return result
})
