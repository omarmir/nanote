import { mkdir } from 'node:fs/promises'
import type { Notebook } from '#shared/types/notebook'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import { checkIfPathExists } from '~~/server/utils'

/**
 * Create notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, notebook, fullPath, _parentFolder, name): Promise<Notebook> => {
    const t = await useTranslation(event)

    //If folder already exists check
    const notebookExists = await checkIfPathExists(fullPath)
    if (notebookExists)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: t('errors.notebookAlreadyExists')
      })

    try {
      // Create the directory
      await mkdir(fullPath)

      // Return the new notebook structure matching your type
      return {
        pathArray: notebook.slice(0, -1) ?? [],
        name: name ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        notebookCount: 0,
        noteCount: 0,
        path: fullPath,
        apiPath: notebook.join('/')
      } satisfies Notebook
    } catch (error) {
      console.error('Error creating notebook:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: t('errors.failedCreateNotebook')
      })
    }
  },
  { notebookCheck: false }
)
