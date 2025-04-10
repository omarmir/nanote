import type { EventHandlerRequest, H3Event } from 'h3'
import { defineEventHandlerWithNotebookAndNote } from './note'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { uploadPath } from '../folder'

const fileRegex = /::(file|fileBlock)\{href="(?<href>[^"]+)?"? title="(?<title>[^"]+)?"?\}/g

type EventHandlerWithAttachment<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  notebooks: string[],
  note: string,
  fullPath: string,
  notebookPath: string,
  markAttachmentForDeletionIfNeeded: (
    newFileData: Buffer<ArrayBufferLike> | null,
    oldFileData: Buffer<ArrayBufferLike> | null
  ) => void
) => Promise<D>

export function defineEventHandlerWithAttachmentNotebookNote<T extends EventHandlerRequest, D>(
  handler: EventHandlerWithAttachment<T, D>
) {
  return defineEventHandlerWithNotebookAndNote(
    async (event, notebooks, note, fullPath, notebookPath) => {
      const markAttachmentForDeletionIfNeeded = async (
        newFileData: Buffer<ArrayBufferLike> | null,
        oldFileData: Buffer<ArrayBufferLike> | null
      ) => {
        const newNoteContent = (newFileData ?? '').toString()
        const oldNoteContent = (oldFileData ?? '').toString()

        const newMatches = [...newNoteContent.matchAll(fileRegex)]
          .map((match) => match.groups?.href.split('/').at(-1))
          .filter((item) => item !== undefined)

        const oldMatches = [...oldNoteContent.matchAll(fileRegex)]
          .map((match) => match.groups?.href.split('/').at(-1))
          .filter((item) => item !== undefined)

        const uniqueMatches = [
          ...newMatches.filter((item) => !oldMatches.includes(item)),
          ...oldMatches.filter((item) => !newMatches.includes(item))
        ]

        for (const match of uniqueMatches) {
          const filePath = join(uploadPath, 'attachments', match)
          await unlink(filePath)
        }
      }

      try {
        return await handler(event, notebooks, note, fullPath, notebookPath, markAttachmentForDeletionIfNeeded)
      } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
          throw error
        }
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to process attachment'
        })
      }
    },
    { noteCheck: true }
  )
}
