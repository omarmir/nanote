import { defineEventHandlerWithNotebookAndNote } from '../../wrappers/note'
import { shared } from '~~/server/db/schema'
import { nanoid } from 'nanoid'
import type { Result } from '#shared/types/result'

export default defineEventHandlerWithNotebookAndNote(
  async (event, pathArray, note, _fullPath, _isMarkdown, _targetFolder, apiPath): Promise<Result<string>> => {
    await authorize(event, editAllNotes)

    const t = await useTranslation(event)
    const body = await readBody(event)

    const sharingKey = nanoid(40)

    try {
      await db.insert(shared).values({
        key: sharingKey,
        name: body?.name ?? nanoid(16),
        path: apiPath
      })

      // Return success response with the generated key
      return {
        success: true,
        data: sharingKey
      }
    } catch (dbError) {
      console.error('Database error while creating share link:', dbError)
      // Handle potential database errors (e.g., connection issues, constraint violations)
      throw createError({
        statusCode: 500,
        statusMessage: t('errors.httpCodes.500'),
        message: t('errors.failedCreateShareLink')
      })
    }
  }
)
