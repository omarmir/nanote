import type { EventHandlerRequest, H3Event } from 'h3'
import { access, constants } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { notesPath } from '~~/server/folder'
import type { APIError } from '#shared/types/result'

type EventHandlerWithNotebook<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  pathArray: string[],
  fullPath: string,
  parentFolder: string,
  name: string | undefined
) => Promise<D>

export function defineEventHandlerWithNotebook<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithNotebook<T, D>,
  options?: { notebookCheck: boolean }
) {
  return defineEventHandler(async event => {
    const t = await useTranslation(event)

    // Decode the path and then remove characters we cannot have
    const params = decodeURIComponent(event.context.params?.path ?? '')
    const pathArray = params
      .split('/')
      .map(p => p.replace(/[\\/:*?"<>|.]/g, ''))
      .filter(Boolean) // Removes empty strings

    // Construct paths
    const fullPath = join(notesPath, ...pathArray)
    const targetFolder = resolve(fullPath)

    // Check OS path length limitations
    const isWindows = process.platform === 'win32'
    const maxPathLength = isWindows ? 259 : 4095 // Windows MAX_PATH (260 incl. null) vs Linux/macOS PATH_MAX (4096)

    if (fullPath.length > maxPathLength) {
      throw createError({
        statusCode: 400,
        statusMessage: t('errors.httpCodes.400'),
        message: t('errors.notebookPathTooLong', { maxLength: maxPathLength })
      })
    }

    const parentFolderArray = pathArray.slice(0, -1) ?? []
    const parentFolder = join(notesPath, ...parentFolderArray)
    const name = pathArray.at(-1)

    // This is for a new notebook, we can bail early
    if (options?.notebookCheck === false) return await handler(event, pathArray, fullPath, parentFolder, name)

    // Security checks
    if (!targetFolder.startsWith(resolve(notesPath))) {
      throw createError({
        statusCode: 400,
        statusMessage: t('errors.httpCodes.400'),
        message: t('errors.invalidNotebookPath')
      })
    }
    try {
      // Check if notebook exists
      await access(targetFolder, constants.R_OK | constants.W_OK) // Make sure its readable and writable
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: t('errors.httpCodes.404'),
        message: t('errors.notebookNotFound', { path: pathArray.join(' > ') })
      })
    }
    try {
      return await handler(event, pathArray, fullPath, parentFolder, name)
    } catch (error) {
      console.log(event, error)
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: t('errors.httpCodes.404'),
          message: t('errors.noteOrNotebookNotFound')
        })
      } else if (error instanceof URIError) {
        throw createError({
          statusCode: 400,
          statusMessage: t('errors.httpCodes.400'),
          message: t('errors.invalidUrlEncoding')
        })
      } else if (error instanceof Error && 'statusCode' in error) {
        const err = error as APIError
        throw createError({
          statusCode: err.statusCode ?? 500,
          statusMessage: err.statusMessage ?? 'Internal Server Error',
          message: err.message ?? t('errors.unexpectedError')
        })
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: t('errors.httpCodes.500'),
          message: t('errors.unexpectedError')
        })
      }
    }
  })
}
