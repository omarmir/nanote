import { rm } from 'node:fs/promises'

import { defineEventHandlerWithNotebook } from '~/server/wrappers/notebook'
import type { DeleteNotebook } from '~/types/notebook'

/**
 * Dekete notebook
 */
export default defineEventHandlerWithNotebook(
  async (_event, cleanNotebook, fullPath) => {
    try {
      // Read file contents and stats
      await rm(fullPath, { recursive: true, force: true })

      return {
        notebook: cleanNotebook,
        deleted: true,
        timestamp: new Date().toISOString()
      } satisfies DeleteNotebook
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Note or notebook does not exist'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to delete note'
      })
    }
  },
  { notebookCheck: true }
)
