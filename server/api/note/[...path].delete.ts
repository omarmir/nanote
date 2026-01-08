import { unlink } from 'node:fs/promises'
import { shared } from '~~/server/db/schema'
import { defineEventHandlerWithAttachmentNotebookNote } from '~~/server/wrappers/attachment'

/**
 * Delete note
 */
export default defineEventHandlerWithAttachmentNotebookNote(
  async (
    event,
    notebook,
    _note,
    fullPath,
    _markAttachmentForDeletionIfNeeded,
    deleteAllAttachments,
    apiPath
  ): Promise<boolean> => {
    await authorize(event, editAllNotes)

    await unlink(fullPath)

    await deleteAllAttachments()

    // Delete the note if it was shared but don't need to wait for it
    event.waitUntil(
      db
        .delete(shared)
        .where(eq(shared.path, apiPath))
        .catch(() => ({}))
    )

    return true
  }
)
