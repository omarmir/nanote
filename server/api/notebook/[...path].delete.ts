import { rm } from 'node:fs/promises'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'

/**
 * Delete notebook
 */
export default defineEventHandlerWithNotebook(
  async (event, _cleanNotebook, fullPath): Promise<boolean> => {
    await authorize(event, editAllNotes)

    // Read file contents and stats
    await rm(fullPath, { recursive: true, force: true })

    return true
  },
  { notebookCheck: true }
)
