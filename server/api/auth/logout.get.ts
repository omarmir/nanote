import { defineEventHandlerWithError } from '~/server/wrappers/error'

export default defineEventHandlerWithError(async (event): Promise<void> => {
  deleteCookie(event, 'token')
})
