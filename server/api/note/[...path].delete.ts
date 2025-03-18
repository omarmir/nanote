import { unlink } from 'node:fs/promises'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { DeleteNote } from '~/types/notebook'
import type { APIError } from '~/types/result'

/**
 * Delete note
 */
export default defineEventHandlerWithNotebookAndNote(async (_event, notebook, note, fullPath): Promise<DeleteNote> => {
  try {
    // Read file contents and stats
    await unlink(fullPath)

    return {
      notebook: notebook,
      name: note,
      deleted: true,
      timestamp: new Date().toISOString()
    } satisfies DeleteNote
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Note or notebook does not exist'
      })
    }
    const err = error as APIError
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? 'Internal Server Error',
      message: err.message ?? 'Failed to delete note'
    })
  }
})
