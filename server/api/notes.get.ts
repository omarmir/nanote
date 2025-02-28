// server/api/notes.ts
import { defineEventHandler } from 'h3'
import { promisify } from 'node:util'
import { exec as execCallback } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Note } from '~/types/notebook'
import basePath from '~/server/folder'

// Promisified exec for convenience
const exec = promisify(execCallback)

// Helper to return the correct command string based on platform.
// We wrap basePath in quotes in case there are spaces.
function getCommand(notes: number): string {
  const quotedBaseDir = `"${basePath}"`
  if (process.platform === 'linux') {
    // Linux: Uses GNU find with -printf
    return `find ${quotedBaseDir} -type f -name "*.md" -printf '%T@ %p\n' | sort -n | tail -${notes}`
  } else if (process.platform === 'darwin') {
    // macOS: BSD find doesn't support -printf so we use stat.
    return `find ${quotedBaseDir} -type f -name "*.md" -exec stat -f "%m %N" {} \\; | sort -n | tail -${notes}`
  } else if (process.platform === 'win32') {
    // Windows: Use PowerShell to mimic similar functionality.
    // This command sorts all *.md files by LastWriteTime and then selects the last 5.
    return `powershell.exe -Command "Get-ChildItem -Path '${basePath}' -Recurse -Filter '*.md' | Sort-Object LastWriteTime | Select-Object -Last ${notes} | ForEach-Object { \\"$($_.LastWriteTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')) $($_.FullName)\\" }"`
  } else {
    // Fallback: Use the Linux command.
    return `find ${quotedBaseDir} -type f -name "*.md" -printf '%T@ %p\n' | sort -n | tail -5`
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery<{ display: number }>(event)

  try {
    const command = getCommand(query.display ?? 5)
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      console.error('stderr:', stderr)
    }
    // Each line should contain the modification time and the full file path.
    // Note: On Linux and macOS, the first token is numeric (seconds since epoch).
    // On Windows, our command outputs an ISO string for the modification time.
    const lines = stdout
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
    const notes: Note[] = []

    for (const line of lines) {
      // Split at the first space so that file paths with spaces work correctly.
      const firstSpaceIndex = line.indexOf(' ')
      if (firstSpaceIndex === -1) continue

      const filePath = line.substring(firstSpaceIndex + 1).trim()

      // Retrieve full file statistics for creation date, modification date, and size.
      const stats = await fs.stat(filePath)
      // Get the file path relative to the base directory.
      const relativeFilePath = path.relative(basePath, filePath)
      // Build the notebook array from the relative folder structure.
      const notebookDirs =
        path.dirname(relativeFilePath) !== '.' ? path.dirname(relativeFilePath).split(path.sep).filter(Boolean) : []

      notes.push({
        name: path.basename(filePath, '.md'),
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
        notebook: notebookDirs,
        size: Math.round(stats.size / 1024) // size in kilobytes
      })
    }
    return notes
  } catch (error) {
    console.log('Unable to list recent notes', error)
    console.error('Error reading notebook:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve recent notes'
    })
  }
})
