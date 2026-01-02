import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithNotebookAndNote } from './note'
import { readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { uploadPath } from '../folder'

const fileRegex = /::(file|fileBlock)\{href="(?<href>[^"]+)?"? title="(?<title>[^"]+)?"?\}/g

type EventHandlerWithAttachment<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  notebooks: string[],
  note: string,
  fullPath: string,
  markAttachmentForDeletionIfNeeded: (newFileData: Buffer<ArrayBufferLike> | null) => Promise<void>,
  deleteAllAttachments: () => Promise<void>
) => Promise<D>

export function defineEventHandlerWithAttachmentNotebookNote<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithAttachment<T, D>
) {
  return defineEventHandlerWithNotebookAndNote(
    async (event, notebooks, note, fullPath) => {
      const t = await useTranslation(event)

      const oldNoteContent = await readFile(fullPath, 'utf-8')

      const deleteAllAttachments = async () => {
        const oldMatches = [...oldNoteContent.matchAll(fileRegex)]
          .map(match => match.groups?.href.split('/').at(-1))
          .filter(item => item !== undefined)

        for (const match of oldMatches) {
          const filePath = join(uploadPath, 'attachments', match)
          try {
            await unlink(filePath)
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
              throw error
            }
          }
        }
      }

      const markAttachmentForDeletionIfNeeded = async (newFileData: Buffer<ArrayBufferLike> | null) => {
        const newNoteContent = (newFileData ?? '').toString()

        const newMatches = [...newNoteContent.matchAll(fileRegex)]
          .map(match => match.groups?.href.split('/').at(-1))
          .filter(item => item !== undefined)

        const oldMatches = [...oldNoteContent.matchAll(fileRegex)]
          .map(match => match.groups?.href.split('/').at(-1))
          .filter(item => item !== undefined)

        const uniqueMatches = oldMatches.filter(item => !newMatches.includes(item))

        for (const match of uniqueMatches) {
          const filePath = join(uploadPath, 'attachments', match)
          try {
            await unlink(filePath)
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
              throw error
            }
          }
        }
      }

      try {
        return await handler(event, notebooks, note, fullPath, markAttachmentForDeletionIfNeeded, deleteAllAttachments)
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw createError({
          statusCode: 500,
          statusMessage: t('errors.httpCodes.500'),
          message: t('errors.failedProcessAttachment')
        })
      }
    },
    { noteCheck: true }
  )
}
