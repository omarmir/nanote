import type { EventHandlerRequest, H3Event } from 'h3'
import type { APIError } from '#shared/types/result'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithError<T extends EventHandlerRequest, D>(handler: EventHandlerWithError<T, D>) {
  return defineEventHandler(async event => {
    const t = await useTranslation(event)

    try {
      return await handler(event)
    } catch (error) {
      console.log(event, error)
      if (error instanceof URIError) {
        throw createError({
          statusCode: 400,
          statusMessage: t('errors.httpCodes.400'),
          message: 'Invalid URL encoding.'
        })
      } else if (error instanceof Error && 'statusCode' in error) {
        const err = error as APIError
        throw createError({
          statusCode: err.statusCode ?? 500,
          statusMessage: err.statusMessage ?? 'Internal Server Error',
          message: err.message ?? 'An unexpected error occurred'
        })
      } else if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: t('errors.httpCodes.404'),
          message: 'The requested file does not exist.'
        })
      } else if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EACCES') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'Permission denied: Cannot access the requested file.'
        })
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: t('errors.httpCodes.500'),
          message: 'An unexpected error occurred'
        })
      }
    }
  })
}
