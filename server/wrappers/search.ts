import type { ExecSyncOptions } from 'node:child_process'
import type { EventHandlerRequest, H3Event } from 'h3'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { platform } from 'node:os'
import escape from 'shell-escape'
import { MAX_RESULTS, type USearchResult } from '#shared/types/ugrep'
import { notesPath } from '~~/server/folder'

type EventHandlerWithSearch<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  searchResults: USearchResult[]
) => Promise<D>

export function defineEventHandlerWithSearch<T extends EventHandlerRequest, D>(handler: EventHandlerWithSearch<T, D>) {
  return defineEventHandler(async (event) => {
    const t = await useTranslation(event)

    const fullPath = resolve(notesPath)
    const { q: rawQuery } = getQuery(event)

    if (!rawQuery || typeof rawQuery !== 'string') {
      throw createError({ statusCode: 400, message: t('errors.missingQuery') })
    }

    const results: USearchResult[] = []
    const queryLower = rawQuery.toLowerCase()

    // Prepare command based on platform:
    let command: string
    const execOptions: ExecSyncOptions = { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 }

    if (platform() === 'win32') {
      // Windows: Use PowerShell's Get-ChildItem to list folders and markdown files
      // We enclose fullPath in single quotes and escape it properly.
      // command = `Get-ChildItem -Path '${fullPath}' -Recurse | ForEach-Object { $_.FullName }`
      command = `Get-ChildItem -Path '${fullPath}' -Recurse | ForEach-Object { if ($_.PSIsContainer) { "dir:$($_.FullName)" } else { "file:$($_.FullName)" } }`
      execOptions.shell = 'powershell.exe'
    } else {
      // Unix (Linux/macOS): Use find to search for directories (-type d)
      const searchPath = escape([fullPath])
      command = `find ${searchPath} -type d -printf "dir:%p\n" -o -type f -printf "file:%p\n"`
      // command = `find ${searchPath} \\( -type d -o -type f \\)`
    }

    try {
      const output = execSync(command, execOptions) as string
      const lines = output.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        const [type, full] = line.split(':', 2)
        if (!type || !full) continue

        const relativePath = full.replace(fullPath, '').split(/[/\\]/).filter(Boolean)
        if (relativePath.length === 0) continue

        const baseName = relativePath[relativePath.length - 1]
        if (!baseName.toLowerCase().includes(queryLower)) continue

        const isFolder = type === 'dir'

        const queryWords = splitWords(rawQuery)
        const score = matchScore(queryWords, baseName)
        results.push({
          notebook: relativePath.slice(0, -1),
          name: baseName,
          matchType: isFolder ? 'folder' : 'note',
          snippet: `${isFolder ? 'Folder' : 'File'} name contains "${rawQuery}"`,
          score: score,
          lineNum: undefined
        })
      }
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: error,
        message: t('errors.unableToSearch')
      })
    }

    // Deduplicate and sort by score (descending), and limit to MAX_RESULTS (here, 5)
    const searchResults: USearchResult[] = Array.from(new Set(results.map(r => JSON.stringify(r))))
      .map(r => JSON.parse(r) as USearchResult)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)

    return await handler(event, searchResults)
  })
}
