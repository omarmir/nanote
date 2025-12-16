import { rm } from 'node:fs/promises'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'

/**
 * Delete notebook
 */
export default defineEventHandlerWithNotebook(
  async (_event, _cleanNotebook, fullPath): Promise<boolean> => {
    // Read file contents and stats
    await rm(fullPath, { recursive: true, force: true })

    return true
  },
  { notebookCheck: true }
)
