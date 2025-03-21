import { unlink } from 'node:fs/promises'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { DeleteNote } from '~/types/notebook'

/**
 * Delete note
 */
export default defineEventHandlerWithNotebookAndNote(async (event, notebook, note, fullPath): Promise<DeleteNote> => {
  // Read file contents and stats
  await unlink(fullPath)

  const storage = event.context.$attachment.storage
  if (!storage) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Note deleted but storage was not initialized and associated attachments were not marked for deletion'
    })
  } else {
    event.context.$attachment.markAllAttachmentsForNoteForDeletion({ notebook, note })
  }

  return {
    notebook: notebook,
    name: note,
    deleted: true,
    timestamp: new Date().toISOString()
  } satisfies DeleteNote
})
