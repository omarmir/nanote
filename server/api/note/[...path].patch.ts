import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { defineEventHandlerWithAttachmentNotebookNote } from '~~/server/wrappers/attachment'
import type { NoteResponse } from '#shared/types/notebook'

/**
 * Update note
 */

export default defineEventHandlerWithAttachmentNotebookNote(
  async (event, notebook, note, fullPath, markAttachmentForDeletionIfNeeded): Promise<NoteResponse> => {
    const t = await useTranslation(event)

    // Parse form data
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.missingFormData')
      })
    }

    // Find file in form data
    const fileEntry = formData.find((entry) => entry.name === 'file')
    if (!fileEntry?.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('errors.noFileUploaded')
      })
    }

    // Get original stats first to preserve creation date
    const originalStats = await stat(fullPath)
    const originalStatsCreatedAtTime =
      originalStats.birthtime.getTime() !== 0 ? originalStats.birthtime : originalStats.ctime

    // Overwrite file content
    await writeFile(fullPath, fileEntry.data)

    // remove any attachments that are gone
    await markAttachmentForDeletionIfNeeded(fileEntry.data)

    // Get new stats after update
    const newStats = await stat(fullPath)

    return {
      notebook,
      note,
      path: fullPath,
      createdAt: originalStatsCreatedAtTime.toISOString(),
      updatedAt: newStats.mtime.toISOString(),
      size: newStats.size,
      originalFilename: fileEntry.filename || 'unknown'
    } satisfies NoteResponse
  }
)
