import { stat } from 'node:fs/promises'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { Note } from '~/types/notebook'
import type { APIError } from '~/types/result'

/**
 * Get note info
 */
export default defineEventHandlerWithNotebookAndNote(async (_event, notebooks, note, fullPath): Promise<Note> => {
  try {
    // Read file contents and stats
    const stats = await stat(fullPath)
    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

    return {
      name: note,
      notebook: notebooks,
      createdAt: createdAtTime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      size: stats.size // Optional: Remove if not needed
    } satisfies Note
  } catch (error) {
    console.error('Error reading note:', error)
    const err = error as APIError
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? 'Internal Server Error',
      message: err.message ?? 'Failed to retrieve note'
    })
  }
})
