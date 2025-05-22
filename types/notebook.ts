export type Notebook = {
  name: string
  createdAt: string
  updatedAt: string | null
  noteCount: number
  notebookCount: number
  notebooks: string[]
  contents?: NotebookContents
  path: string
}

export type Note = {
  name: string
  createdAt: string
  updatedAt: string | null
  notebook: string[]
  size?: number
  isMarkdown: boolean
}

export type NotebookContents = {
  path: string
  notebooks?: Record<string, Notebook>
  notes: Note[]
  pathArray: string[]
}

export type NoteResponse = {
  notebook: string[]
  note: string
  path: string
  createdAt: string
  updatedAt: string
  size: number
  originalFilename: string
}

export type RenameNotebook = {
  oldName: string
  path: string
  newName: string
  createdAt: string
  updatedAt: string
  notebooks: string[]
}

export type RenameNote = {
  oldName: string
  newName: string
  notebook: string[]
  createdAt: string
  updatedAt: string
}

export type DeleteNote = {
  name: string
  timestamp: string
  notebook: string[]
  deleted: boolean
}

export type DeleteNotebook = {
  timestamp: string
  notebook: string[]
  deleted: boolean
}

export type SavingState = 'pending' | 'saving' | 'success' | 'error' | 'idle'

export type SearchResult = {
  notebook: string[]
  name: string | null
  matchType: 'folder' | 'note' | 'content'
  snippet: string
  score: number
}

export type NotebookDisplay = 'main' | 'sidebar' | 'other'
