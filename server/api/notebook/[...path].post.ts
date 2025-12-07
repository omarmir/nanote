import { mkdir } from 'node:fs/promises'
import type { NotebookTreeItem } from '#shared/types/notebook'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import { checkIfPathExists } from '~~/server/utils'

/**
 * Create notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, pathArray, fullPath, _parentFolder, name): Promise<NotebookTreeItem> => {
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
        label: name ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        notebookCount: 0,
        noteCount: 0,
        path: fullPath,
        children: [LAZY_LOAD_PLACEHOLDER],
        pathArray: [...pathArray, name ?? ''],
        isNote: false,
        apiPath: `${pathArray.join('/')}/${name ?? ''}`,
        disabled: false
      } satisfies NotebookTreeItem
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
