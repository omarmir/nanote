type UgrepMatch = {
  match: string
  line: number
}

export type UgrepResult = {
  file: string
  matches: UgrepMatch[]
}

export type USearchResult = {
  pathArray: string[]
  name: string
  snippet: string
  score: number
  lineNum: number | undefined
  matchType: 'note' | 'content' | 'folder'
}

export const MAX_RESULTS = 10
export const CONTEXT_CHARS = 50
