import { sendStream, setHeaders } from 'h3'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { createReadStream } from 'node:fs'
import contentDisposition from 'content-disposition'

import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'

export default defineEventHandlerWithNotebookAndNote(
  async (event, _cleanNotebook, cleanNote, fullPath): Promise<void> => {
    await authorize(event, editAllNotes)

    // Get info
    const stats = await stat(fullPath)

    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime
    const createdAt = createdAtTime.toISOString()
    const updatedAt = stats.mtime.toISOString()

    // Determine content type based on file extension
    const fileExtension = extname(fullPath).toLowerCase()

    const contentType = fileExtension === '.md' ? 'text/markdown' : 'text/plain'
    // Set appropriate headers
    setHeaders(event, {
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition(`${cleanNote}`, { type: 'attachment' }),
      'Cache-Control': 'no-cache',
      'Content-Created': createdAt,
      'Content-Updated': updatedAt
    })

    // Return file stream
    return sendStream(event, createReadStream(fullPath))
  }
)
