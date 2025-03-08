import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { platform } from 'node:os'
import type { ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import escape from 'shell-escape'
import type { SearchResult } from '~/types/notebook'
import basePath from '~/server/folder'

const CONTEXT_CHARS = 50
const MAX_RESULTS = 5

export default defineEventHandler(async (event): Promise<SearchResult[]> => {
  const fullPath = resolve(basePath)
  const { q: rawQuery } = getQuery(event)

  if (!rawQuery || typeof rawQuery !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing query.' })
  }

  const results: SearchResult[] = []
  const query = escape([rawQuery.replace(/[^\w\- ]/g, '')])
  const osPlatform = platform()

  // 1. Search folder names
  const folders = await readdir(fullPath, { withFileTypes: true })
  for (const folder of folders.filter((d) => d.isDirectory())) {
    if (folder.name.toLowerCase().includes(rawQuery.toLowerCase())) {
      const relativePath = folder.parentPath.replace(fullPath, '').split(/[/\\]/).filter(Boolean)
      results.push({
        notebook: relativePath,
        name: folder.name,
        matchType: 'folder',
        snippet: `Notebook name contains "${rawQuery}"`,
        score: 1
      })
    }
  }

  // 2. Search note names across all notebooks
  for (const folder of folders.filter((d) => d.isDirectory())) {
    const notes = await readdir(join(fullPath, folder.name), { withFileTypes: true })
    for (const note of notes.filter((f) => f.isFile() && f.name.endsWith('.md'))) {
      const noteName = note.name.replace(/\.md$/, '')
      if (noteName.toLowerCase().includes(rawQuery.toLowerCase())) {
        const relativePath = note.parentPath.replace(fullPath, '').split(/[/\\]/).filter(Boolean)
        results.push({
          notebook: relativePath,
          name: noteName,
          matchType: 'note',
          snippet: `Note name contains "${rawQuery}"`,
          score: 2
        })
      }
    }
  }

  // 3. Optimized content search
  try {
    let command: string
    const searchPath = escape([fullPath])

    if (osPlatform === 'linux') {
      command = `grep -r -i -m1 -P -oH ".{0,${CONTEXT_CHARS}}${query}.{0,${CONTEXT_CHARS}}" --include="*.md" ${searchPath} || true`
    } else if (osPlatform === 'darwin') {
      command = `grep -r -i -m1 -E -oH ".{0,${CONTEXT_CHARS}}${query}.{0,${CONTEXT_CHARS}}" --include="*.md" ${searchPath} || true`
    } else {
      // Windows fallback using PowerShell (slower but works)
      const escapedQuery = rawQuery.replace(/"/g, '""')
      command =
        `Get-ChildItem -Path ${searchPath} -Recurse -Filter *.md | ` +
        `Select-String -Pattern "${escapedQuery}" -CaseSensitive:$false | ` +
        `Select-Object -First ${MAX_RESULTS} | ` +
        `ForEach-Object { "$($_.Path)|~|$($_.Line)" }`
    }

    const execOptions: ExecSyncOptionsWithStringEncoding = {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    }

    // When on Windows, use PowerShell as the shell
    if (osPlatform === 'win32') {
      execOptions.shell = 'powershell.exe'
    }

    const output = execSync(command, execOptions)

    // Parse results
    const contentResults = output
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        let filePath, snippet
        if (osPlatform === 'win32' && line.includes('|~|')) {
          // Windows output (custom delimiter)
          ;[filePath, snippet] = line.split('|~|')
        } else {
          // Linux/macOS output (colon-delimited)
          const [p, ...rest] = line.split(':')
          filePath = p
          snippet = rest.join(':')
        }

        // Split paths on both forward and backslashes
        const relativePath = filePath.replace(fullPath, '').split(/[/\\]/).filter(Boolean)

        return {
          notebook: relativePath.slice(0, relativePath.length - 1),
          name: relativePath[1]?.replace(/\.md$/, ''),
          snippet: snippet.trim().slice(0, CONTEXT_CHARS * 2),
          score: 3,
          matchType: 'content'
        } satisfies SearchResult
      })

    results.push(...contentResults.filter((r) => r.notebook))
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error,
      message: 'Unable to search. Check console for details.'
    })
  }

  // Deduplicate and sort
  return Array.from(new Set(results.map((r) => JSON.stringify(r))))
    .map((r) => JSON.parse(r) as SearchResult)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
})
