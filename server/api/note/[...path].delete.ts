import { unlink } from 'node:fs/promises'
import { defineEventHandlerWithAttachmentNotebookNote } from '~~/server/wrappers/attachment'

/**
 * Delete note
 */
export default defineEventHandlerWithAttachmentNotebookNote(
  async (
    _event,
    _notebook,
    _note,
    fullPath,
    _markAttachmentForDeletionIfNeeded,
    deleteAllAttachments
  ): Promise<boolean> => {
    // Read file contents and stats
    await unlink(fullPath)

    await deleteAllAttachments()

    return true
  }
)
