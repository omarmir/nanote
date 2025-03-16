import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { NoteResponse } from '~/types/notebook'
import { defineEventHandlerWithStorage } from '~/server/wrappers/storage'
import type { UploadItem } from '~/types/upload'
import type { StorageValue, Storage } from 'unstorage'

const fileRegex = /::(file|fileBlock)\{href="(?<href>[^"]+)?"? title="(?<title>[^"]+)?"?\}/g

// const matches = [...x.matchAll(reg)].map(match => match.groups);

// console.log(matches);

const markAttachmentForDeletionIfNeeded = async (
  notebook: string[],
  note: string,
  storage: Storage<StorageValue>,
  fileData: Buffer<ArrayBufferLike>
) => {
  const uploads = await storage.getItem<UploadItem[]>('uploads')
  console.log(uploads)
}

/**
 * Update note
 */
export default defineEventHandlerWithStorage(async (event, storage): Promise<NoteResponse> => {
  return defineEventHandlerWithNotebookAndNote(async (_event, notebook, note, fullPath): Promise<NoteResponse> => {
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
      event.waitUntil(markAttachmentForDeletionIfNeeded(notebook, note, storage))

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
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to update note'
      })
    }
  })(event)
})
