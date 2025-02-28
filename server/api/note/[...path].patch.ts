import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
// import { waitforme } from '~/server/utils'

/**
 * Update note
 */
export default defineEventHandlerWithNotebookAndNote(async (event, notebook, note, fullPath) => {
  // Parse form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing form data'
    })
  }

  // await waitforme(5000)

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

    return {
      notebook: notebook,
      note: note,
      path: fullPath,
      createdAt: originalStatsCreatedAtTime.toISOString(),
      updatedAt: newStats.mtime.toISOString(),
      size: newStats.size,
      originalFilename: fileEntry.filename || 'unknown'
    }
  } catch (error) {
    console.error('Error updating note:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to update note'
    })
  }
})
