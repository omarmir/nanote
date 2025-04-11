import { sendStream, setHeaders } from 'h3'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'

export default defineEventHandlerWithNotebookAndNote(async (event, _cleanNotebook, cleanNote, fullPath) => {
  try {
    //Get info
    const stats = await stat(fullPath)

    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime
    const createdAt = createdAtTime.toISOString()
    const updatedAt = stats.mtime.toISOString()

    // Set appropriate headers
    setHeaders(event, {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${cleanNote}"`,
      'Cache-Control': 'no-cache',
      'Content-Created': createdAt,
      'Content-Updated': updatedAt
    })

    // Return file stream
    return sendStream(event, createReadStream(fullPath))
  } catch (error) {
    console.error('Error serving file:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve file'
    })
  }
})
