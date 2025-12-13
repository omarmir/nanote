import { unlink } from 'node:fs/promises'
import { defineEventHandlerWithAttachmentNotebookNote } from '~~/server/wrappers/attachment'

/**
 * Delete note
 */
export default defineEventHandlerWithAttachmentNotebookNote(
  async (
    event,
    notebook,
    note,
    fullPath,
    _markAttachmentForDeletionIfNeeded,
    deleteAllAttachments
  ): Promise<DeleteNote> => {
    // Read file contents and stats
    await unlink(fullPath)

    await deleteAllAttachments()

    return true
  }
)
