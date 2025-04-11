import { rename, access, constants, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { defineEventHandlerWithNotebook } from '~/server/wrappers/notebook'
import type { RenameNotebook } from '~/types/notebook'

/**
 * Rename notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, notebook, fullPath, parentFolder) => {
    const body = await readBody(event)
    try {
      // Validate input
      if (!body?.newName) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Missing new name for notebook.'
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
          message: 'New notebook name already exists'
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
    } catch (error) {
      if (error instanceof URIError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid URL encoding'
        })
      }

      const httpError = error as { statusCode?: number }
      if (httpError.statusCode) throw error

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to rename notebook'
      })
    }
  },
  { notebookCheck: false }
)
