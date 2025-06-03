import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithError } from './error'
import { checkLogin } from '../utils'
import type jwt from 'jsonwebtoken'
import type { Result } from '~/types/result'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithAttachmentAuthError<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithError<T, D>
) {
  return defineEventHandlerWithError(async (event) => {
    // Just a regular user session
    const cookie = getCookie(event, 'token')
    const verifyResult = checkLogin(cookie)
    if (verifyResult.success) return await handler(event)
    // pdf export
    const { token } = getQuery(event)

    if (token && typeof token === 'string') {
      const file = event.context.params?.file

      if (!file) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Attachment name not specified.'
        })
      }

      const verifyPDF = checkLogin(token, { subject: decodeURI(file) }) as Result<jwt.JwtPayload>
      if (verifyPDF.success) return await handler(event)
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: verifyResult.message
    })
  })
}
