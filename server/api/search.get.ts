import { resolve } from 'node:path'
import type { ExecException, ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import escape from 'shell-escape'
import { notesPath } from '~~/server/folder'
import { defineEventHandlerWithSearch } from '../wrappers/search'
import { defineEventHandlerWithError } from '../wrappers/error'
import { CONTEXT_CHARS, MAX_RESULTS, type UgrepResult, type USearchResult } from '#shared/types/ugrep'
import { matchScore, splitWords } from '../utils/search'

export default defineEventHandlerWithError(async (event): Promise<USearchResult[]> => {
  return defineEventHandlerWithSearch(async (_event, searchResults): Promise<USearchResult[]> => {
    const fullPath = resolve(notesPath)
    const { q: rawQuery } = getQuery(event)

    if (!rawQuery || typeof rawQuery !== 'string') {
      throw createError({ statusCode: 400, message: 'Missing query.' })
    }

    const results: USearchResult[] = []
    const queryWords = splitWords(rawQuery)

    // 3. Optimized content search using ugrep
    try {
      const searchPath = escape([fullPath])
      // const ugrepPattern = queryWords.map((q) => `-e ${escape([q])}`).join(' ')
      // const lookaheads = queryWords.map((word) => `(?=.*\\b${escape([word])}\\b)`).join('')
      const lookaheads = queryWords.map((word) => `(?=.*${escape([word])})`).join('')

      // Combine them into the full pattern
      const ugrepPattern = `-P '^${lookaheads}.*$'`

      const command = [
        'ugrep',
        '-r', // recursive
        '-n', // adds line numbers
        '-I', // ignore binary
        `-C${Math.floor(CONTEXT_CHARS)}`, // contenxt chars (even division before and after)
        '--json', // JSON output
        '--ignore-case', // case insensitive
        '--format=json',
        '--max-files=2000', // if this is too big, then it ends up causing issues
        ugrepPattern,
        searchPath
      ].join(' ')

      const execOptions: ExecSyncOptionsWithStringEncoding = {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 600 // 600MB buffer
      }

      let output: string
      try {
        output = execSync(command, execOptions)
      } catch (err) {
        // ugrep returns exit code 1 if no matches, but still outputs valid JSON
        const error = err as ExecException
        if (error.stdout && error.stdout.trim().startsWith('[')) {
          output = error.stdout
        } else {
          console.dir(error, { depth: null })
          throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: error,
            message: 'Unable to search. Check console for details.'
          })
        }
      }

      const jsonOutput = JSON.parse(output.toString()) as UgrepResult[]

      const contentResults = jsonOutput.flatMap(({ file, matches }) => {
        const relativePath = file.replace(fullPath, '').split(/[/\\]/).filter(Boolean)

        return matches.map(({ match, line }) => {
          const score = matchScore(queryWords, match)
          const name = relativePath.at(-1) as string
          const pathArray = relativePath.slice(0, -1)

          return {
            pathArray: [...pathArray, name],
            name,
            snippet: match.trim().slice(0, CONTEXT_CHARS * 2),
            score,
            matchType: 'content',
            lineNum: line
          } satisfies USearchResult
        })
      })

      results.push(...contentResults.filter((r) => r.pathArray))
    } catch (error) {
      console.dir(error, { depth: null })
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: error,
        message: 'Unable to search. Check console for details.'
      })
    }

    // const searchSortedResults = Array.from(new Set(results))

    const seen = new Set<string>()
    const dedupedResults = results.filter((r) => {
      const key = `${r.pathArray.join('')}|${r.name}|${r.lineNum}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const sortedContentResults = [
      ...dedupedResults,
      ...searchResults.map((r) => ({ ...r, lineNum: 0, score: r.score ?? 0 }))
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)

    sortedContentResults.push(...searchResults.map((r) => ({ ...r, lineNum: 0, score: r.score ?? 0 })))
    return sortedContentResults
  })(event)
})
