import type { ExecSyncOptions } from 'node:child_process'
import type { EventHandlerRequest, H3Event } from 'h3'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { platform } from 'node:os'
import escape from 'shell-escape'
import type { SearchResult } from '~/types/notebook'
import { notesPath } from '~/server/folder'

type EventHandlerWithSearch<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  searchResults: SearchResult[]
) => Promise<D>

export function defineEventHandlerWithSearch<T extends EventHandlerRequest, D>(handler: EventHandlerWithSearch<T, D>) {
  return defineEventHandler(async (event) => {
    const fullPath = resolve(notesPath)
    const { q: rawQuery } = getQuery(event)

    if (!rawQuery || typeof rawQuery !== 'string') {
      throw createError({ statusCode: 400, message: 'Missing query.' })
    }

    const results: SearchResult[] = []
    const queryLower = rawQuery.toLowerCase()

    // Prepare command based on platform:
    let command: string
    const execOptions: ExecSyncOptions = { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 }

    if (platform() === 'win32') {
      // Windows: Use PowerShell's Get-ChildItem to list folders and markdown files
      // We enclose fullPath in single quotes and escape it properly.
      command = `Get-ChildItem -Path '${fullPath}' -Recurse | Where-Object { $_.PSIsContainer -or $_.Extension -eq '.md' } | ForEach-Object { $_.FullName }`
      execOptions.shell = 'powershell.exe'
    } else {
      // Unix (Linux/macOS): Use find to search for directories (-type d) and markdown files (-type f -iname "*.md")
      const searchPath = escape([fullPath])
      command = `find ${searchPath} \\( -type d -o \\( -type f -iname "*.md" \\) \\)`
    }

    try {
      const output = execSync(command, execOptions) as string
      const lines = output.split('\n').filter((line) => line.trim() !== '')

      for (const line of lines) {
        // Compute a relative path array by removing the fullPath prefix.
        const relativePath = line.replace(fullPath, '').split(/[/\\]/).filter(Boolean)
        if (relativePath.length === 0) continue

        // The last segment is the base name (either a folder or a file)
        const baseName = relativePath[relativePath.length - 1]
        if (!baseName.toLowerCase().includes(queryLower)) continue

        if (baseName.toLowerCase().endsWith('.md')) {
          // It's a markdown note: remove the extension and treat notebook as parent folder path.
          const noteName = baseName.replace(/\.md$/i, '')
          results.push({
            notebook: relativePath.slice(0, -1),
            name: noteName,
            matchType: 'note',
            snippet: `Note name contains "${rawQuery}"`,
            score: 2
          })
        } else {
          // It's a folder.
          results.push({
            notebook: relativePath,
            name: baseName,
            matchType: 'folder',
            snippet: `Notebook name contains "${rawQuery}"`,
            score: 1
          })
        }
      }
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: error,
        message: 'Unable to search. Check console for details.'
      })
    }

    // Deduplicate and sort by score (descending), and limit to MAX_RESULTS (here, 5)
    const searchResults: SearchResult[] = Array.from(new Set(results.map((r) => JSON.stringify(r))))
      .map((r) => JSON.parse(r) as SearchResult)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return await handler(event, searchResults)
  })
}
