import { unlink } from 'node:fs/promises'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { DeleteNote } from '~/types/notebook'

/**
 * Delete note
 */
export default defineEventHandlerWithNotebookAndNote(async (_event, notebook, note, fullPath): Promise<DeleteNote> => {
  // Read file contents and stats
  await unlink(fullPath)

  return {
    notebook: notebook,
    name: note,
    deleted: true,
    timestamp: new Date().toISOString()
  } satisfies DeleteNote
})
