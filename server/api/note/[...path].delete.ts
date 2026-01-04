import { unlink } from 'node:fs/promises'
import { defineEventHandlerWithAttachmentNotebookNote } from '~~/server/wrappers/attachment'

/**
 * Delete note
 */
export default defineEventHandlerWithAttachmentNotebookNote(
  async (
    event,
    _notebook,
    _note,
    fullPath,
    _markAttachmentForDeletionIfNeeded,
    deleteAllAttachments
  ): Promise<boolean> => {
    await authorize(event, editAllNotes)

    // Read file contents and stats
    await unlink(fullPath)

    await deleteAllAttachments()

    return true
  }
)
