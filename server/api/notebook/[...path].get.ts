import { readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { defineEventHandlerWithNotebook } from '~~/server/wrappers/notebook'
import { LAZY_LOAD_PLACEHOLDER, type NotebookTreeItem } from '#shared/types/notebook'
/**
 * Returns contents for a specific notebook
 */
export default defineEventHandlerWithNotebook(async (_event, pathArray, fullPath): Promise<NotebookTreeItem[]> => {
  // Read directory contents
  const files = await readdir(fullPath, { withFileTypes: true })
  const notebookContents: NotebookTreeItem[] = []
  // Process files concurrently
  await Promise.all(
    files.map(async (dirent) => {
      const filePath = join(fullPath, dirent.name)
      const stats = await stat(filePath)
      const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime
      if (dirent.isFile()) {
        const note = {
          label: dirent.name,
          createdAt: createdAtTime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          size: stats.size / 1024,
          isMarkdown: extname(filePath).toLowerCase() === '.md',
          path: filePath,
          pathArray: [...pathArray, dirent.name],
          isNote: true,
          apiPath: `${pathArray.join('/')}/${dirent.name}`,
          disabled: false
        } satisfies NotebookTreeItem
        notebookContents.push(note)
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
          label: dirent.name,
          createdAt: createdAtTime.toISOString(),
          noteCount: fileCount,
          notebookCount: folderCount,
          children: fileCount + folderCount > 0 ? [LAZY_LOAD_PLACEHOLDER] : [],
          updatedAt:
            updatedAt?.toISOString()
            ?? new Date(Math.max(stats.birthtime.getTime(), stats.mtime.getTime())).toISOString(),
          path: notebookPath,
          pathArray: [...pathArray, dirent.name],
          isNote: false,
          apiPath: `${pathArray.join('/')}/${dirent.name}`,
          disabled: false
        } satisfies NotebookTreeItem

        notebookContents.push(nestedNotebook)
      }
    })
  )
  return notebookContents
})
