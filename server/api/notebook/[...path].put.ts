import { rename, access, constants, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import type { RenameNotebook } from '#shared/types/notebook'

/**
 * Rename notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, notebook, fullPath, parentFolder): Promise<RenameNotebook> => {
    const t = await useTranslation(event)
    const body = await readBody(event)
    // Validate input
    if (!body?.newName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.missingNewNotebookName')
      })
    }

    const newName = decodeURIComponent(body.newName)
    const cleanNewName = newName.replace(/[\\/:*?"<>|.]/g, '')

    // Construct paths
    const newPath = resolve(join(parentFolder, cleanNewName))

    // Check if new name exists
    try {
      await access(newPath, constants.F_OK)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: t('errors.notebookAlreadyExists')
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }

    // Perform rename
    await rename(fullPath, newPath)

    // Get updated stats
    const stats = await stat(newPath)
    const notebookName = notebook.at(-1) ?? ''

    return {
      oldName: notebookName,
      newName: cleanNewName,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      notebooks: notebook.slice(0, -1), // Have to slice off itself since the notebooks is built off the fetch url which in this case includes this book
      path: newPath
    } satisfies RenameNotebook
  },
  { notebookCheck: false }
)
