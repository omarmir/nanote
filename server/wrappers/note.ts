import type { EventHandlerRequest, H3Event } from 'h3'
import { access, constants } from 'node:fs/promises'
import { join, resolve, extname } from 'node:path'
import { notesPath } from '~~/server/folder'
import type { APIError } from '#shared/types/result'

type EventHandlerWithNotebookAndNote<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  pathArray: string[],
  note: string,
  fullPath: string,
  isMarkdown: boolean,
  targetFolder: string
) => Promise<D>

export function defineEventHandlerWithNotebookAndNote<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithNotebookAndNote<T, D>,
  options?: { noteCheck: boolean }
) {
  return defineEventHandler(async (event) => {
    const t = await useTranslation(event)

    // Decode the path and then remove characters we cannot have
    const params = decodeURIComponent(event.context.params?.path ?? '')
    const path = params.split('/').map(p => p.replace(/[\\/:*?"<>|]/g, '')) || []
    const pathArray = path.slice(0, -1).filter(Boolean) // filter out the blank path the root
    const note = path.at(-1)

    if (pathArray.length === 0 || !note) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.missingNotebookOrNote')
      })
    }

    // Construct paths
    const targetFolder = resolve(join(notesPath, ...pathArray))
    const filename = note
    const fullPath = join(targetFolder, filename)

    const fileExtension = extname(fullPath).toLowerCase()
    const isMarkdown = fileExtension === '.md'

    // Is the name going to exceed limits?
    if (note.length > 255) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.nameExceedsLimit')
      })
    }

    // Add OS path length validation
    const isWindows = process.platform === 'win32'
    const maxPathLength = isWindows ? 259 : 4095 // Same limits as folder creation

    if (fullPath.length > maxPathLength) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.pathExceedsLimit', { maxLength: maxPathLength })
      })
    }

    // Security checks
    if (!targetFolder.startsWith(resolve(notesPath))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.invalidNotebookPath')
      })
    }

    try {
      // Verify notebook and note exist and is read/write allowed
      await access(targetFolder, constants.R_OK | constants.W_OK)
      if (options?.noteCheck) await access(fullPath, constants.R_OK | constants.W_OK)
    } catch (error) {
      console.error('Note error:', error)

      const err = error as NodeJS.ErrnoException
      const message
        = err.code === 'ENOENT'
          ? err.path === targetFolder
            ? t('errors.notebookNotFound', { path: pathArray.join(' > ') })
            : t('errors.noteNotFound', { note })
          : t('errors.accessError')

      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message
      })
    }
    try {
      return await handler(event, pathArray, note, fullPath, isMarkdown, targetFolder)
    } catch (error) {
      console.log(event, error)
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: t('errors.noteOrNotebookNotFound')
        })
      } else if (error instanceof URIError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
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
          statusMessage: 'Internal Server Error',
          message: t('errors.unexpectedError')
        })
      }
    }
  })
}
