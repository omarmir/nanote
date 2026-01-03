// server/api/notes.ts
import path from 'node:path'
import type { Note } from '#shared/types/notebook'
import { notesPath } from '~~/server/folder'
import fg from 'fast-glob'
import fs from 'fs'
import { defineEventHandlerWithError } from '../wrappers/error'

export default defineEventHandlerWithError(async (event): Promise<Note[]> => {
  await authorize(event, editAllNotes)

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

  const notes: Note[] = await Promise.all(
    recentFiles.map(async file => {
      const relativePath = path.relative(notesPath, file.path)
      const pathArray =
        path.dirname(relativePath) !== '.' ? path.dirname(relativePath).split(path.sep).filter(Boolean) : []

      let preview = ''
      try {
        const stream = fs.createReadStream(file.path, { encoding: 'utf-8', start: 0, end: 2048 }) // Read first 1KB
        preview = await new Promise((resolve, reject) => {
          let data = ''
          stream.on('data', chunk => {
            data += chunk
          })
          stream.on('close', () => resolve(data.split('\n').slice(0, 5).join('\n')))
          stream.on('error', reject)
        })
      } catch (err) {
        console.error(`Failed to read file ${file.path}:`, err)
      }

      const isMarkdown = path.extname(file.path).toLowerCase() === '.md'

      return {
        name: file.name,
        createdAt: file.stats!.birthtime.toISOString(),
        updatedAt: file.stats!.mtime.toISOString(),
        pathArray: [...pathArray, file.name],
        apiPath: `${pathArray.join('/')}/${file.name}`,
        isMarkdown,
        preview // Add the preview text
      }
    })
  )

  return notes
})
