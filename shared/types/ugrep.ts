type UgrepMatch = {
  match: string
  line: number
}

export type UgrepResult = {
  file: string
  matches: UgrepMatch[]
}

export type USearchResult = {
  notebook: string[]
  name: string | null
  matchType: 'folder' | 'note' | 'content'
  snippet: string
  score: number
  lineNum: number | undefined
}

export const MAX_RESULTS = 10
export const CONTEXT_CHARS = 50
