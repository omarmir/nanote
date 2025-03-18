import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { NoteResponse } from '~/types/notebook'
import type { APIError } from '~/types/result'

/**
 * Update note
 */

export default defineEventHandlerWithNotebookAndNote(async (event, notebook, note, fullPath): Promise<NoteResponse> => {
  // Parse form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing form data'
    })
  }

  // Find file in form data
  const fileEntry = formData.find((entry) => entry.name === 'file')
  if (!fileEntry?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No file uploaded'
    })
  }

  try {
    // Get original stats first to preserve creation date
    const originalStats = await stat(fullPath)
    const originalStatsCreatedAtTime =
      originalStats.birthtime.getTime() !== 0 ? originalStats.birthtime : originalStats.ctime
    // Overwrite file content
    await writeFile(fullPath, fileEntry.data)

    // Get new stats after update
    const newStats = await stat(fullPath)

    // Let the notes get marked for deletion
    const storage = event.context.$attachment.storage
    if (!storage) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Upload storage not initialized'
      })
    } else {
      event.context.$attachment.addToQueueForAttachmentMarking({ notebook, note, fileData: fileEntry.data })
    }

    return {
      notebook,
      note,
      path: fullPath,
      createdAt: originalStatsCreatedAtTime.toISOString(),
      updatedAt: newStats.mtime.toISOString(),
      size: newStats.size,
      originalFilename: fileEntry.filename || 'unknown'
    } satisfies NoteResponse
  } catch (error) {
    console.error('Error updating note:', error)
    const err = error as APIError
    throw createError({
      statusCode: err.statusCode ?? 500,
      statusMessage: err.statusMessage ?? 'Internal Server Error',
      message: err.message ?? 'Failed to update note'
    })
  }
})
