import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithError } from './error'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithAttachmentAuthError<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithError<T, D>
) {
  return defineEventHandlerWithError(async event => {
    const t = await useTranslation(event)

    const session = await getUserSession(event)

    if (session.user) {
      return await handler(event)
    }

    const internalHeader = getHeader(event, 'x-internal-secret')
    const isValid = isValidInternalSecret(internalHeader)

    if (isValid) {
      return await handler(event)
    }

    throw createError({
      statusCode: 401,
      message: t('errors.authRequired'),
      fatal: true
    })
  })
}
