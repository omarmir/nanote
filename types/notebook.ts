export type Notebook = {
  name: string
  createdAt: string
  updatedAt: string | null
  noteCount: number
  notebookCount: number
  notebooks: string[]
  path: string
}

export type Note = {
  name: string
  createdAt: string
  updatedAt: string | null
  notebook: string[]
  size?: number
}

export type NotebookContents = {
  path: string
  notes: Note[]
  notebooks: Notebook[]
}

export type Contents = {
  name: string
  path: string
  array: string[]
  notes: Note[]
  notebooks: Contents[]
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

export type SavingState = 'pending' | 'saving' | 'success' | 'error'

export type SearchResult = {
  notebook: string[]
  note: string | null
  matchType: 'folder' | 'note' | 'content'
  snippet: string
  score: number
}
