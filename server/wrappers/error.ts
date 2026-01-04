import type { EventHandlerRequest, H3Event } from 'h3'
import type { APIError } from '#shared/types/result'

type EventHandlerWithError<T extends EventHandlerRequest, D> = (event: H3Event<T>) => Promise<D>

export function defineEventHandlerWithError<T extends EventHandlerRequest, D>(handler: EventHandlerWithError<T, D>) {
  return defineEventHandler(async event => {
    try {
      return await handler(event)
    } catch (error) {
      const t = await useTranslation(event)

      const errorMap: Map<number, string> = new Map([
        [400, t('errors.httpCodes.400')],
        [401, t('errors.httpCodes.401')],
        [404, t('errors.httpCodes.404')],
        [403, t('errors.httpCodes.403')],
        [500, t('errors.httpCodes.500')]
      ])

      console.log(event, error)
      if (error instanceof URIError) {
        throw createError({
          statusCode: 400,
          statusMessage: errorMap.get(400),
          message: t('errors.invalidUrlEncoding')
        })
      } else if (error instanceof Error && 'statusCode' in error) {
        const err = error as APIError
        throw createError({
          statusCode: err.statusCode ?? 500,
          statusMessage: errorMap.get(err.statusCode ?? 500),
          message: err.message ?? t('errors.unexpectedError')
        })
      } else if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: errorMap.get(404),
          message: t('errors.fileDoesNotExist')
        })
      } else if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EACCES') {
        throw createError({
          statusCode: 403,
          statusMessage: errorMap.get(403),
          message: t('errors.authRequired')
        })
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: errorMap.get(500),
          message: t('errors.unexpectedError')
        })
      }
    }
  })
}
