import { nanoid } from 'nanoid'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { uploadPath } from '~/server/folder'
import type { UploadItem } from '~/types/upload'
import { notePathArrayJoiner } from '~/utils/path-joiner'

export type AttachmentParams = {
  notebook: string[]
  note: string
  fileData?: Buffer<ArrayBufferLike> | null
}

const storage = createStorage({
  driver: fsDriver({ base: uploadPath })
})

const fileRegex = /::(file|fileBlock)\{href="(?<href>[^"]+)?"? title="(?<title>[^"]+)?"?\}/g

const queue: Array<{ id: string; data: AttachmentParams }> = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const unbouncedDeleteMarkedFiles = async () => {
  const uploads = (await storage.getItem<UploadItem[]>('uploads')) ?? []

  const deletionFiles = uploads.filter((item) => item.deleted === true)
  for (const upload of deletionFiles) {
    const filePath = join(uploadPath, 'attachments', upload.fileName)
    const updatedManifest = uploads.filter((item) => item.fileName !== upload.fileName)

    try {
      await unlink(filePath)
      await storage.setItem('uploads', updatedManifest)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist - remove it
        console.log(updatedManifest)
        await storage.setItem('uploads', updatedManifest)
        console.log('File missing', upload.fileName)
      } else {
        console.log(err)
      }
    }
  }

  console.log('Deleting files', new Date())
}

const deleteMarkedFilesDebounced = debounce(async () => await unbouncedDeleteMarkedFiles(), 1)

const processQueue = async (): Promise<void> => {
  if (queue.length === 0) return

  const job = queue.shift() // Get first job
  if (job) {
    await markAttachmentForDeletionIfNeeded(job.data)
    processQueue() // Process the next job
    deleteMarkedFilesDebounced()
  }
}

// Add job to queue
const addToQueueForAttachmentMarking = (data: AttachmentParams): string => {
  const id = nanoid()
  queue.push({ id, data })
  if (queue.length === 1) processQueue()
  return id
}

const markAttachmentForDeletionIfNeeded = async (params: AttachmentParams) => {
  const uploads = (await storage.getItem<UploadItem[]>('uploads')) ?? []
  const path = notePathArrayJoiner([...params.notebook, params.note])
  const noteContent = (params.fileData ?? '').toString()

  const matches = [...noteContent.matchAll(fileRegex)]
    .map((match) => match.groups?.href.split('/').at(-1))
    .filter((item) => item !== undefined)

  uploads.forEach((upload) => {
    if (upload.path === path && !matches.includes(upload.path)) {
      upload.deleted = true
    }
  })
  await storage.setItem('uploads', uploads)
}

const markAllAttachmentsForNoteForDeletion = async (params: AttachmentParams) => {
  const uploads = (await storage.getItem<UploadItem[]>('uploads')) ?? []
  const path = notePathArrayJoiner([...params.notebook, params.note])

  uploads.forEach((upload) => {
    if (upload.path === path) {
      upload.deleted = true
    }
  })
  await storage.setItem('uploads', uploads)
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context.$attachment = {
      storage,
      addToQueueForAttachmentMarking,
      markAllAttachmentsForNoteForDeletion,
      deleteMarkedFiles: unbouncedDeleteMarkedFiles
    }
  })
})
