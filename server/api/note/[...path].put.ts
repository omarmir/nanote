import { rename, access, constants, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'
import type { RenameTreeItem } from '#shared/types/notebook'
// import { waitforme } from '~~/server/utils'

/**
 * Renaming note
 */
export default defineEventHandlerWithNotebookAndNote(
  async (event, pathArray, note, fullPath, _isMarkdown, targetFolder): Promise<RenameTreeItem> => {
    const t = await useTranslation(event)
    const body = await readBody(event)
    // Validate input
    if (!body?.newName) {
      throw createError({
        statusCode: 400,
        statusMessage: t('errors.httpCodes.400'),
        message: t('errors.missingNewNoteName')
      })
    }

    console.log('fp', fullPath)

    const cleanNewNote = body.newName.replace(/[\\/:*?"<>|]/g, '')

    // Construct paths
    const newPath = resolve(join(targetFolder, cleanNewNote))

    console.log('np', newPath)

    try {
      await access(newPath, constants.F_OK)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: t('errors.noteAlreadyExists')
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }

    // Perform rename
    await rename(fullPath, newPath)

    // create new path array
    const newPathArray = [...pathArray, cleanNewNote]

    // Get updated stats
    const stats = await stat(newPath)

    const fileExtension = extname(newPath).toLowerCase()
    const isMarkdown = fileExtension === '.md'

    return {
      label: cleanNewNote,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      path: newPath,
      pathArray: newPathArray,
      apiPath: `/${newPathArray.join('/')}`,
      isMarkdown
    } satisfies RenameTreeItem
  }
)
