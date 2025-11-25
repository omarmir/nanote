import { rm } from 'node:fs/promises'

import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import type { DeleteNotebook } from '#shared/types/notebook'

/**
 * Dekete notebook
 */
export default defineEventHandlerWithNotebook(
  async (_event, cleanNotebook, fullPath): Promise<DeleteNotebook> => {
    // Read file contents and stats
    await rm(fullPath, { recursive: true, force: true })

    return {
      notebook: cleanNotebook,
      deleted: true,
      timestamp: new Date().toISOString()
    } satisfies DeleteNotebook
  },
  { notebookCheck: true }
)
