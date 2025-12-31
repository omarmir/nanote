type UgrepMatch = {
  match: string
  line: number
}

export type UgrepResult = {
  file: string
  matches: UgrepMatch[]
}

export type SearchMatchType = 'folder' | 'note' | 'content' | 'loading'

export type USearchResult = {
  pathArray: string[]
  name: string
  snippet: string
  score: number
  lineNum: number | undefined
} & (
  | {
      // 1. Explicitly list the non-folder types
      matchType: 'note' | 'content' | 'loading'
      children?: never // Optional: prevents accidental access
    }
  | {
      // 2. The folder type requires children
      matchType: 'folder'
      children: USearchResult[]
    }
)

export const MAX_RESULTS = 10
export const CONTEXT_CHARS = 50
