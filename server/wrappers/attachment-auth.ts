import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithError } from './error'
import { checkLogin } from '../utils'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithAttachmentAuthError<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithError<T, D>
) {
  return defineEventHandlerWithError(async (event) => {
    // Just a regular user session
    const cookie = getCookie(event, 'token')
    const verifyResult = checkLogin(cookie, { audience: 'authorized' })
    if (verifyResult.success) return await handler(event)

    const verifyShared = checkLogin(cookie, { audience: 'shared' })
    console.log('verifyShared', verifyShared)
    if (verifyShared.success) {
      const file = decodeURIComponent(getRouterParam(event, 'file') ?? '')
      // @ts-expect-error dynamic attachments
      const rawAttachments = verifyShared.data.attachments
      const attachments =
        Array.isArray(rawAttachments) && rawAttachments.every((a) => typeof a === 'string')
          ? (rawAttachments as string[])
          : []
      if (attachments.includes(file)) return await handler(event)
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Unauthorized access.'
    })
  })
}
