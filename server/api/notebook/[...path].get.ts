import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { defineEventHandlerWithNotebook } from '~/server/wrappers/notebook'
import type { Note } from '~/types/notebook'
/**
 * Returns list of notes for a specific notebook
 */
export default defineEventHandlerWithNotebook(async (_event, _notebook, _fullPath, parentFolder) => {
  try {
    // Read directory contents
    const files = await readdir(targetFolder, { withFileTypes: true })

    // Process files concurrently
    const notes = await Promise.all(
      files.map(async (dirent) => {
        if (!dirent.isFile() || !dirent.name.endsWith('.md')) return null

        const filePath = join(targetFolder, dirent.name)
        const stats = await stat(filePath)
        const createdAtTime = stats.birthtime.getTime() !== 0 ? stats.birthtime : stats.ctime

        return {
          name: dirent.name.replace(/\.md$/, ''),
          notebook: cleanNotebook,
          createdAt: createdAtTime.toISOString(),
          updatedAt: stats.mtime.toISOString()
        } satisfies Note
      })
    )

    const filteredNotes = notes.filter((note) => note !== null)
    return filteredNotes.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
  } catch (error) {
    console.error('Error reading notebook:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve notes'
    })
  }
})
