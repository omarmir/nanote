import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithError } from './error'
import { checkLogin } from '../utils'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithAttachmentAuthError<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithError<T, D>
) {
  return defineEventHandlerWithError(async (event) => {
    const cookie = getCookie(event, 'token')

    const verifyResult = checkLogin(cookie)

    if (!verifyResult.success)
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: verifyResult.message
      })

    return await handler(event)
  })
}
