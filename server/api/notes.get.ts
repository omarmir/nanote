// server/api/notes.ts
import { defineEventHandler } from 'h3'
import path from 'node:path'
import type { Note } from '~/types/notebook'
import basePath from '~/server/folder'
import fg from 'fast-glob'

export default defineEventHandler(async (event) => {
  const query = getQuery<{ display: number }>(event)
  const displayCount = Math.min(Math.max(Number(query.display) || 5, 1), 100) // Clamp between 1-100

  try {
    const files = await fg('**/*.md', {
      cwd: basePath,
      absolute: true,
      stats: true,
      onlyFiles: true,
      suppressErrors: true // Handle permission issues gracefully
    })

    // Sort by most recently modified first and take top N
    const recentFiles = files.sort((a, b) => b.stats!.mtimeMs - a.stats!.mtimeMs).slice(0, displayCount)

    const notes: Note[] = recentFiles.map((file) => {
      const relativePath = path.relative(basePath, file.path)
      const notebook =
        path.dirname(relativePath) !== '.' ? path.dirname(relativePath).split(path.sep).filter(Boolean) : []

      return {
        name: path.basename(file.path, '.md'),
        createdAt: file.stats!.birthtime.toISOString(),
        updatedAt: file.stats!.mtime.toISOString(),
        notebook,
        size: Math.round(file.stats!.size / 1024)
      }
    })

    return notes
  } catch (error) {
    console.error('Error retrieving recent notes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve recent notes'
    })
  }
})
