import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { Buffer } from 'node:buffer'

import { defineEventHandlerWithNotebookAndNote } from '~/server/wrappers/note'
import type { Note } from '~/types/notebook'
import { checkIfPathExists } from '~/server/utils'

/**
 * Add note
 */
export default defineEventHandlerWithNotebookAndNote(
  async (event, notebook, note, fullPath): Promise<Note> => {
    let fileContent = Buffer.from('')

    // Parse form data if available
    const formData = await readMultipartFormData(event)
    if (formData) {
      const fileEntry = formData.find((entry) => entry.name === 'file')
      if (fileEntry?.data) {
        fileContent = Buffer.from(fileEntry.data)
      }
    }

    /**
     * Try to access the note and if it exists throw a specific error (it exists)
     */
    //If folder already exists check
    const notebookExists = await checkIfPathExists(fullPath)
    if (notebookExists)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Notebook already exists'
      })

    await writeFile(fullPath, fileContent)
    const stats = await stat(fullPath)
    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

    return {
      notebook: notebook,
      name: note,
      createdAt: createdAtTime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      size: stats.size
    } satisfies Note
  },
  {
    noteCheck: false
  }
)
