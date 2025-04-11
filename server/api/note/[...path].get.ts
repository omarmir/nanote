import { stat } from 'node:fs/promises'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'

/**
 * Get note info
 */
export default defineEventHandlerWithNotebookAndNote(async (_event, notebooks, note, fullPath) => {
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
    }
  } catch (error) {
    console.error('Error reading note:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve note'
    })
  }
})
