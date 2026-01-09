import { rename, access, constants, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import type { RenameTreeItem } from '#shared/types/notebook'

/**
 * Rename notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, pathArray, fullPath, parentFolder): Promise<RenameTreeItem> => {
    await authorize(event, editAllNotes)

    const t = await useTranslation(event)
    const body = await readBody(event)
    // Validate input
    if (!body?.newName) {
      throw createError({
        statusCode: 400,
        statusMessage: t('errors.httpCodes.400'),
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

    // create new path array
    const newPathArray = [...pathArray.slice(0, -1), cleanNewName]

    // Get updated stats
    const stats = await stat(newPath)

    return {
      label: cleanNewName,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      path: newPath,
      pathArray: newPathArray,
      apiPath: `/${newPathArray.join('/')}`
    } satisfies RenameTreeItem
  },
  { notebookCheck: false }
)
