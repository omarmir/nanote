import { writeFile, stat } from 'node:fs/promises'
import { readMultipartFormData } from 'h3'
import { Buffer } from 'node:buffer'

import { defineEventHandlerWithNotebookAndNote } from '~~/server/wrappers/note'
import { checkIfPathExists } from '~~/server/utils'
import type { NotebookTreeItem } from '~~/shared/types/notebook'

/**
 * Add note
 */
export default defineEventHandlerWithNotebookAndNote(
  async (event, pathArray, note, fullPath, isMarkdown): Promise<NotebookTreeItem> => {
    await authorize(event, editAllNotes)

    let fileContent = Buffer.from('')

    // Parse form data if available
    const formData = await readMultipartFormData(event)
    if (formData) {
      const fileEntry = formData.find(entry => entry.name === 'file')
      if (fileEntry?.data) {
        fileContent = Buffer.from(fileEntry.data)
      }
    }

    /**
     * Try to access the note and if it exists throw a specific error (it exists)
     */
    // If note already exists check
    const noteExists = await checkIfPathExists(fullPath)
    if (noteExists) {
      const t = await useTranslation(event)
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: t('errors.noteAlreadyExists')
      })
    }

    await writeFile(fullPath, fileContent)
    const stats = await stat(fullPath)
    const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

    const fullPathWithNewFile = [...pathArray, note]

    return {
      label: note,
      createdAt: createdAtTime.toISOString(),
      updatedAt: null,
      notebookCount: 0,
      noteCount: 0,
      path: fullPath,
      pathArray: fullPathWithNewFile,
      isNote: true,
      apiPath: `${fullPathWithNewFile.join('/')}`,
      disabled: false,
      isMarkdown
    } satisfies NotebookTreeItem
  },
  {
    noteCheck: false
  }
)
