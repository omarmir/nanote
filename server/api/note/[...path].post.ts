import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { Buffer } from 'node:buffer'

import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'
import type { Note } from '#shared/types/notebook'
import { checkIfPathExists } from '~~/server/utils'

/**
 * Add note
 */
export default defineEventHandlerWithNotebookAndNote(
  async (event, notebook, note, fullPath): Promise<Note> => {
    const body = await readBody(event)
    const isManualFile = body.isManualFile ?? false

    const mdPath = isManualFile ? fullPath : fullPath.concat('.md')
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
    const notebookExists = await checkIfPathExists(mdPath)
    if (notebookExists)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Notebook already exists'
      })

    console.log(mdPath)
    await writeFile(mdPath, fileContent)
    const stats = await stat(mdPath)
    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

    /**
     * ! By default new creations are Markdown
     */
    return {
      notebook: notebook,
      name: isManualFile ? note : `${note}.md`,
      createdAt: createdAtTime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      size: stats.size,

      isMarkdown: true
    } satisfies Note
  },
  {
    noteCheck: false
  }
)
