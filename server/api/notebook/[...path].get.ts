import { readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { defineEventHandlerWithNotebook } from '~/server/wrappers/notebook'
import type { Note, Notebook, NotebookContents } from '~/types/notebook'
/**
 * Returns contents for a specific notebook
 */
export default defineEventHandlerWithNotebook(async (_event, notebook, fullPath): Promise<NotebookContents> => {
  // Read directory contents
  const files = await readdir(fullPath, { withFileTypes: true })
  const notebookContents: NotebookContents = {
    notes: [] as Note[],
    path: fullPath,
    pathArray: notebook
  }
  // Process files concurrently
  await Promise.all(
    files.map(async (dirent) => {
      const filePath = join(fullPath, dirent.name)
      const stats = await stat(filePath)
      const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime
      if (dirent.isFile()) {
        const note = {
          name: dirent.name,
          notebook: notebook,
          createdAt: createdAtTime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          size: stats.size / 1024,
          isMarkdown: extname(filePath).toLowerCase() === '.md'
        } satisfies Note
        notebookContents.notes.push(note)
      } else if (dirent.isDirectory()) {
        const notebookPath = join(fullPath, dirent.name)
        const notebookFiles = await readdir(notebookPath, { withFileTypes: true })

        const { fileCount, folderCount, updatedAt } = await notebookFiles.reduce(
          async (accPromise, curr) => {
            const acc = await accPromise

            if (curr.isFile()) {
              acc.fileCount++
              const fileStats = await stat(curr.parentPath)
              const fileUpdatedAt = new Date(Math.max(fileStats.birthtime.getTime(), fileStats.mtime.getTime()))
              // Set updatedAt if it's not set or if fileUpdatedAt is more recent
              if (!acc.updatedAt || acc.updatedAt < fileUpdatedAt) {
                acc.updatedAt = fileUpdatedAt
              }
            } else if (curr.isDirectory()) {
              acc.folderCount++
            }

            return acc
          },
          Promise.resolve({ fileCount: 0, folderCount: 0, updatedAt: undefined } as {
            fileCount: number
            folderCount: number
            updatedAt: Date | undefined
          })
        )

        const nestedNotebook = {
          name: dirent.name,
          createdAt: createdAtTime.toISOString(),
          noteCount: fileCount,
          notebookCount: folderCount,
          notebooks: notebook ?? [],
          updatedAt:
            updatedAt?.toISOString() ??
            new Date(Math.max(stats.birthtime.getTime(), stats.mtime.getTime())).toISOString(),
          path: notebookPath
        } satisfies Notebook
        if (!notebookContents.notebooks) {
          notebookContents.notebooks = {}
        }
        notebookContents.notebooks[nestedNotebook.name] = nestedNotebook
      }
    })
  )
  return notebookContents
})
