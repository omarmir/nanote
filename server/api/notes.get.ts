// server/api/notes.ts
import path from 'node:path'
import type { Note } from '~/types/notebook'
import { notesPath } from '~/server/folder'
import fg from 'fast-glob'
import { defineEventHandlerWithError } from '../wrappers/error'

export default defineEventHandlerWithError(async (event): Promise<Note[]> => {
  const query = getQuery<{ display: number }>(event)
  const displayCount = Math.min(Math.max(Number(query.display) || 5, 1), 100) // Clamp between 1-100

  const files = await fg('**/*', {
    cwd: notesPath,
    absolute: true,
    stats: true,
    onlyFiles: true,
    suppressErrors: true // Handle permission issues gracefully
  })

  // Sort by most recently modified first and take top N
  const recentFiles = files.sort((a, b) => b.stats!.mtimeMs - a.stats!.mtimeMs).slice(0, displayCount)

  const notes: Note[] = recentFiles.map((file) => {
    const relativePath = path.relative(notesPath, file.path)
    const notebook =
      path.dirname(relativePath) !== '.' ? path.dirname(relativePath).split(path.sep).filter(Boolean) : []

    return {
      name: file.name,
      createdAt: file.stats!.birthtime.toISOString(),
      updatedAt: file.stats!.mtime.toISOString(),
      notebook,
      size: Math.round(file.stats!.size / 1024),
      isMarkdown: path.extname(file.path).toLowerCase() === '.md'
    }
  })

  return notes
})
