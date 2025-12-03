import { defineEventHandlerWithNotebookAndNote } from '../../wrappers/note'
import { shared } from '~~/server/db/schema'
import { nanoid } from 'nanoid'
import type { Result } from '#shared/types/result'
import { notePathArrayJoiner } from '#shared/utils/path-joiner'

export default defineEventHandlerWithNotebookAndNote(
  async (event, notebooks, note, fullPath): Promise<Result<string>> => {
    const t = await useTranslation(event)
    const { name } = await readBody(event)

    console.log(`Attempting to share note at: ${fullPath}`)

    const sharingKey = nanoid(40)

    try {
      await db.insert(shared).values({
        key: sharingKey,
        name,
        path: '/'.concat(notePathArrayJoiner([...notebooks, note]))
      })

      console.log(`Successfully created share link for "${fullPath}" with key "${sharingKey}"`)

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
        statusMessage: 'Internal Server Error',
        message: t('errors.failedCreateShareLink')
      })
    }
  }
)
