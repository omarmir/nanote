import { resolve } from 'node:path'
import type { ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import escape from 'shell-escape'
import type { SearchResult } from '~/types/notebook'
import { notesPath } from '~/server/folder'
import { defineEventHandlerWithSearch } from '../wrappers/search'
import { defineEventHandlerWithError } from '../wrappers/error'

const CONTEXT_CHARS = 50
const MAX_RESULTS = 5

function splitWords(text: string): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
  return Array.from(segmenter.segment(text))
    .map((segment) => segment.segment)
    .filter((word) => /\p{L}|\p{N}/u.test(word)) // letters/numbers
    .map((word) => word.toLowerCase())
}

export default defineEventHandlerWithError(async (event): Promise<SearchResult[]> => {
  return defineEventHandlerWithSearch(async (_event, searchResults): Promise<SearchResult[]> => {
    const fullPath = resolve(notesPath)
    const { q: rawQuery } = getQuery(event)

    if (!rawQuery || typeof rawQuery !== 'string') {
      throw createError({ statusCode: 400, message: 'Missing query.' })
    }

    const results: SearchResult[] = []
    const queryWords = splitWords(rawQuery)

    // 3. Optimized content search using ugrep
    try {
      const searchPath = escape([fullPath])
      const ugrepPattern = queryWords.map((q) => `-e ${escape([q])}`).join(' ')

      const command = [
        'ugrep',
        '-r', // recursive
        '--json', // JSON output
        '--ignore-case', // case insensitive
        '--format=json', // JSON format
        '--context=0', // no extra lines
        ugrepPattern,
        searchPath
      ].join(' ')

      const execOptions: ExecSyncOptionsWithStringEncoding = {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }

      const output = execSync(command, execOptions)

      const contentResults = output
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          try {
            const { file, line: lineNum, text } = JSON.parse(line)

            const lowerText = text.toLowerCase()
            const matchedWords = queryWords.filter((word) => lowerText.includes(word))
            const score = Math.max(1, Math.min(5, matchedWords.length))

            const relativePath = file.replace(fullPath, '').split(/[/\\]/).filter(Boolean)

            return {
              notebook: relativePath.slice(0, -1),
              name: relativePath.at(-1) as string,
              snippet: text.trim().slice(0, CONTEXT_CHARS * 2),
              score,
              matchType: 'content',
              lineNum
            } satisfies SearchResult & { lineNum: number }
          } catch {
            return null
          }
        })
        .filter(Boolean) as SearchResult[]

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
    const contentResults = Array.from(new Set(results.map((r) => JSON.stringify(r))))
      .map((r) => JSON.parse(r) as SearchResult)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)

    contentResults.push(...searchResults)
    return contentResults
  })(event)
})
