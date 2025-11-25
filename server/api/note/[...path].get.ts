import { stat } from 'node:fs/promises'
import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'
import type { Note } from '#shared/types/notebook'

/**
 * Get note info
 */
export default defineEventHandlerWithNotebookAndNote(
  async (_event, notebooks, note, fullPath, _notebookPath, isMarkdown): Promise<Note> => {
    // Read file contents and stats
    const stats = await stat(fullPath)
    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

    return {
      name: note,
      notebook: notebooks,
      createdAt: createdAtTime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      size: stats.size, // Optional: Remove if not needed
      isMarkdown
    } satisfies Note
  }
)
